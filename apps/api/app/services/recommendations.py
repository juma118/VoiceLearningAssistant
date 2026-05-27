from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Lesson, ProgressEvent, Recommendation


def refresh_recommendations(db: Session, student_id: int) -> list[Recommendation]:
    weak_events = list(
        db.scalars(
            select(ProgressEvent)
            .where(ProgressEvent.student_id == student_id, ProgressEvent.topic != "")
            .order_by(ProgressEvent.created_at.desc())
            .limit(5)
        )
    )
    existing_topics = {
        topic
        for (topic,) in db.execute(select(Recommendation.topic).where(Recommendation.student_id == student_id))
    }
    created: list[Recommendation] = []
    for event in weak_events:
        if event.topic in existing_topics:
            continue
        lesson = db.scalar(select(Lesson).where(Lesson.title.ilike(f"%{event.topic}%")))
        recommendation = Recommendation(
            student_id=student_id,
            lesson_id=lesson.id if lesson else event.lesson_id,
            topic=event.topic,
            reason=f"Recent activity suggests more practice with {event.topic}.",
            priority=2 if event.score and event.score < 60 else 1,
        )
        db.add(recommendation)
        created.append(recommendation)
    db.commit()
    return created
