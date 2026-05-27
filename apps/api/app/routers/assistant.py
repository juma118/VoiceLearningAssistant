from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.deps import current_user, db_session
from app.models import Conversation, Lesson, Message, ProgressEvent, Resource, User
from app.schemas import AssistantRequest, AssistantResponse, TTSRequest, TTSResponse, TranscriptionResponse
from app.services.providers import language_provider, llm_provider, voice_provider
from app.services.rag import RagHit, rag_service

router = APIRouter(prefix="/assistant", tags=["assistant"])


@router.post("/chat", response_model=AssistantResponse)
async def chat(
    payload: AssistantRequest,
    db: Session = Depends(db_session),
    student: User = Depends(current_user),
) -> AssistantResponse:
    detected_language = language_provider.detect_language(payload.message)
    hits = rag_service.search(payload.message, payload.course_id, 5)
    if not hits:
        hits = _database_context_hits(db, payload.message, payload.course_id, payload.lesson_id, 5)
    context = "\n\n".join(f"{hit.title}: {hit.snippet}" for hit in hits)
    llm_result = await llm_provider.answer(payload.message, context)
    answer = await language_provider.translate(llm_result.answer, payload.target_language)
    audio_base64 = await voice_provider.synthesize(answer) if payload.include_audio else None

    conversation = db.get(Conversation, payload.conversation_id) if payload.conversation_id else None
    if not conversation:
        conversation = Conversation(
            student_id=student.id,
            course_id=payload.course_id,
            lesson_id=payload.lesson_id,
            title=payload.message[:80],
        )
        db.add(conversation)
        db.flush()

    citations = [hit.__dict__ for hit in hits]
    db.add_all(
        [
            Message(
                conversation_id=conversation.id,
                sender="student",
                content=payload.message,
                language=detected_language,
                citations=[],
            ),
            Message(
                conversation_id=conversation.id,
                sender="assistant",
                content=answer,
                language=payload.target_language or detected_language,
                citations=citations,
            ),
            ProgressEvent(
                student_id=student.id,
                lesson_id=payload.lesson_id,
                event_type="asked_question",
                topic=_topic_from_question(payload.message),
                metadata_json={"course_id": payload.course_id},
            ),
        ]
    )
    db.commit()

    return AssistantResponse(
        conversation_id=conversation.id,
        answer=answer,
        detected_language=detected_language,
        citations=citations,
        suggested_followups=llm_result.suggested_followups,
        audio_base64=audio_base64,
    )


@router.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe(file: UploadFile = File(...), _: User = Depends(current_user)) -> dict[str, str]:
    text, language = await voice_provider.transcribe(await file.read(), file.filename)
    return {"text": text, "language": language}


@router.post("/tts", response_model=TTSResponse)
async def tts(payload: TTSRequest, _: User = Depends(current_user)) -> TTSResponse:
    audio = await voice_provider.synthesize(payload.text, payload.voice_id)
    if audio is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Text-to-speech provider is not configured. Use browser speech playback instead.",
        )
    return TTSResponse(audio_base64=audio)


@router.post("/voice-chat", response_model=AssistantResponse, status_code=status.HTTP_201_CREATED)
async def voice_chat(
    file: UploadFile = File(...),
    db: Session = Depends(db_session),
    student: User = Depends(current_user),
) -> AssistantResponse:
    text, _ = await voice_provider.transcribe(await file.read(), file.filename)
    return await chat(AssistantRequest(message=text, include_audio=True), db, student)


def _topic_from_question(question: str) -> str:
    lowered = question.lower()
    for topic in ["github", "python", "functions", "rest", "api", "debugging", "javascript", "react"]:
        if topic in lowered:
            return topic.upper() if topic == "api" else topic.title()
    return "General Programming"


def _database_context_hits(
    db: Session,
    query: str,
    course_id: int | None,
    lesson_id: int | None,
    limit: int,
) -> list[RagHit]:
    query_terms = _tokenize(query)
    resources_statement = select(Resource)
    lessons_statement = select(Lesson)
    if course_id:
        resources_statement = resources_statement.where(Resource.course_id == course_id)
        lessons_statement = lessons_statement.where(Lesson.course_id == course_id)
    if lesson_id:
        resources_statement = resources_statement.where(Resource.lesson_id == lesson_id)
        lessons_statement = lessons_statement.where(Lesson.id == lesson_id)

    candidates: list[RagHit] = []
    for resource in db.scalars(resources_statement).all():
        candidates.append(
            RagHit(
                resource_id=resource.id,
                lesson_id=resource.lesson_id,
                title=resource.title,
                snippet=resource.content[:900],
                score=_keyword_score(query_terms, resource.title, resource.content),
                metadata={"source": "database_resource", "course_id": resource.course_id},
            )
        )
    for lesson in db.scalars(lessons_statement).all():
        candidates.append(
            RagHit(
                resource_id=None,
                lesson_id=lesson.id,
                title=lesson.title,
                snippet=(lesson.summary or lesson.content)[:900],
                score=_keyword_score(query_terms, lesson.title, lesson.content),
                metadata={"source": "database_lesson", "course_id": lesson.course_id},
            )
        )

    candidates.sort(key=lambda hit: hit.score, reverse=True)
    if candidates and candidates[0].score > 0:
        return candidates[:limit]
    return candidates[: min(limit, 2)]


def _tokenize(text: str) -> set[str]:
    return {token for token in "".join(char.lower() if char.isalnum() else " " for char in text).split() if len(token) > 2}


def _keyword_score(query_terms: set[str], title: str, content: str) -> float:
    haystack = _tokenize(f"{title} {content}")
    if not query_terms or not haystack:
        return 0.05
    overlap = query_terms & haystack
    return min(1.0, len(overlap) / max(len(query_terms), 1))
