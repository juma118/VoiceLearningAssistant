from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.deps import current_user, db_session, instructor_user
from app.models import User
from app.schemas import InstructorAnalytics, ProgressSummary
from app.services.analytics import instructor_analytics, progress_summary

router = APIRouter(tags=["analytics"])


@router.get("/progress/summary", response_model=ProgressSummary)
def student_progress(
    db: Session = Depends(db_session), student: User = Depends(current_user)
) -> dict:
    return progress_summary(db, student.id)


@router.get("/instructor/analytics", response_model=InstructorAnalytics)
def analytics(
    db: Session = Depends(db_session), _: User = Depends(instructor_user)
) -> dict:
    return instructor_analytics(db)
