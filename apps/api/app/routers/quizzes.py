from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.deps import current_user, db_session
from app.models import Lesson, ProgressEvent, Quiz, User
from app.schemas import QuizAttemptCreate, QuizAttemptRead, QuizRead
from app.services.quizzes import generate_quiz, grade_attempt
from app.services.recommendations import refresh_recommendations

router = APIRouter(prefix="/quizzes", tags=["quizzes"])


@router.post("/generate/{lesson_id}", response_model=QuizRead, status_code=status.HTTP_201_CREATED)
def create_quiz(
    lesson_id: int, db: Session = Depends(db_session), _: User = Depends(current_user)
) -> Quiz:
    lesson = db.get(Lesson, lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found.")
    return generate_quiz(db, lesson)


@router.get("/lesson/{lesson_id}", response_model=list[QuizRead])
def list_lesson_quizzes(
    lesson_id: int, db: Session = Depends(db_session), _: User = Depends(current_user)
) -> list[Quiz]:
    return list(db.scalars(select(Quiz).where(Quiz.lesson_id == lesson_id)).all())


@router.post("/{quiz_id}/attempts", response_model=QuizAttemptRead, status_code=status.HTTP_201_CREATED)
def submit_attempt(
    quiz_id: int,
    payload: QuizAttemptCreate,
    db: Session = Depends(db_session),
    student: User = Depends(current_user),
) -> object:
    quiz = db.get(Quiz, quiz_id)
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found.")
    attempt = grade_attempt(db, quiz, student.id, payload.answers)
    if attempt.score < 70:
        db.add(
            ProgressEvent(
                student_id=student.id,
                lesson_id=quiz.lesson_id,
                event_type="weak_topic",
                topic=quiz.title.replace(" Practice Quiz", ""),
                score=attempt.score,
            )
        )
        db.commit()
        refresh_recommendations(db, student.id)
    return attempt
