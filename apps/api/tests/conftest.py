import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.database import Base
from app.models import Lesson, Quiz


@pytest.fixture()
def db_session() -> Session:
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(engine)
    session = sessionmaker(bind=engine, autoflush=False, autocommit=False, expire_on_commit=False)()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture()
def quiz_factory(db_session: Session):
    def _factory() -> Quiz:
        lesson = Lesson(
            course_id=1,
            title="REST APIs",
            slug="rest-apis",
            content="REST APIs connect applications.",
            summary="APIs connect apps.",
            position=1,
            estimated_minutes=20,
        )
        db_session.add(lesson)
        db_session.flush()
        quiz = Quiz(
            lesson_id=lesson.id,
            title="REST APIs Practice Quiz",
            questions=[
                {
                    "prompt": "What is the goal?",
                    "question_type": "multiple_choice",
                    "options": ["Wrong", "To understand and apply the concept in code"],
                    "correct_answer": "To understand and apply the concept in code",
                    "explanation": "Practice the concept.",
                },
                {
                    "prompt": "Explain it.",
                    "question_type": "short_answer",
                    "options": [],
                    "correct_answer": "Use a realistic explanation.",
                    "explanation": "Long enough answers pass demo grading.",
                },
            ],
        )
        db_session.add(quiz)
        db_session.commit()
        db_session.refresh(quiz)
        return quiz

    return _factory
