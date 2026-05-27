from collections import Counter

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import Lesson, Message, ProgressEvent, QuizAttempt, Recommendation, User, UserRole


def progress_summary(db: Session, student_id: int) -> dict:
    completed_lessons = db.scalar(
        select(func.count(ProgressEvent.id)).where(
            ProgressEvent.student_id == student_id,
            ProgressEvent.event_type == "lesson_completed",
        )
    ) or 0
    average_score = db.scalar(select(func.avg(QuizAttempt.score)).where(QuizAttempt.student_id == student_id))
    events = list(
        db.scalars(
            select(ProgressEvent)
            .where(ProgressEvent.student_id == student_id)
            .order_by(ProgressEvent.created_at.desc())
            .limit(10)
        )
    )
    weak_topics = [
        event.topic
        for event in events
        if event.topic and (event.event_type == "weak_topic" or (event.score is not None and event.score < 70))
    ]
    recommendations = list(
        db.scalars(
            select(Recommendation)
            .where(Recommendation.student_id == student_id)
            .order_by(Recommendation.priority.desc(), Recommendation.created_at.desc())
            .limit(5)
        )
    )
    return {
        "completed_lessons": completed_lessons,
        "average_score": float(average_score or 0),
        "weak_topics": weak_topics[:5],
        "recent_activity": [
            {
                "event_type": event.event_type,
                "topic": event.topic,
                "score": event.score,
                "created_at": event.created_at.isoformat(),
            }
            for event in events
        ],
        "recommendations": [
            {"topic": item.topic, "reason": item.reason, "lesson_id": item.lesson_id}
            for item in recommendations
        ],
    }


def instructor_analytics(db: Session) -> dict:
    active_students = db.scalar(select(func.count(User.id)).where(User.role == UserRole.student)) or 0
    total_questions = db.scalar(select(func.count(Message.id)).where(Message.sender == "student")) or 0
    recent_questions = list(
        db.scalars(select(Message).where(Message.sender == "student").order_by(Message.created_at.desc()).limit(10))
    )
    events = list(db.scalars(select(ProgressEvent).where(ProgressEvent.topic != "")))
    topic_counts = Counter(event.topic for event in events if event.topic)
    lessons = list(db.scalars(select(Lesson).limit(10)))
    return {
        "active_students": active_students,
        "total_questions": total_questions,
        "difficult_lessons": [
            {"lesson_id": lesson.id, "title": lesson.title, "signal": "Needs more practice"}
            for lesson in lessons[:5]
        ],
        "weak_topics": [
            {"topic": topic, "count": count} for topic, count in topic_counts.most_common(8)
        ],
        "recent_questions": [
            {
                "conversation_id": message.conversation_id,
                "content": message.content,
                "created_at": message.created_at.isoformat(),
            }
            for message in recent_questions
        ],
    }
