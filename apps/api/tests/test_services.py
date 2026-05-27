from app.services.providers import EmbeddingProvider, LLMProvider, LanguageProvider
from app.services.quizzes import grade_attempt


def test_deterministic_embeddings_are_stable() -> None:
    provider = EmbeddingProvider()
    first = provider._deterministic_embedding("REST APIs connect apps")
    second = provider._deterministic_embedding("REST APIs connect apps")
    assert first == second
    assert len(first) == 64


def test_language_detection_falls_back_for_empty_text() -> None:
    provider = LanguageProvider()
    assert provider.detect_language("") == "en"


def test_grade_attempt_scores_multiple_choice(db_session, quiz_factory) -> None:
    quiz = quiz_factory()
    attempt = grade_attempt(
        db_session,
        quiz,
        student_id=1,
        answers={
            "0": "To understand and apply the concept in code",
            "1": "A useful realistic example with enough words to explain the idea",
        },
    )
    assert attempt.score == 100


def test_local_tutor_fallback_answers_without_rag_match() -> None:
    provider = LLMProvider()
    result = provider._fallback_answer("Can you list GitHub APIs to list users?", "")
    assert "api.github.com/users" in result.answer
    assert "No indexed material matched" not in result.answer
