from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.deps import current_user, db_session, instructor_user
from app.models import Course, Lesson, ProgressEvent, User
from app.schemas import CourseCreate, CourseRead, LessonCreate, LessonRead

router = APIRouter(prefix="/courses", tags=["courses"])


@router.get("", response_model=list[CourseRead])
def list_courses(db: Session = Depends(db_session), _: User = Depends(current_user)) -> list[Course]:
    return list(db.scalars(select(Course).order_by(Course.created_at.desc())).all())


@router.post("", response_model=CourseRead, status_code=status.HTTP_201_CREATED)
def create_course(
    payload: CourseCreate,
    db: Session = Depends(db_session),
    instructor: User = Depends(instructor_user),
) -> Course:
    course = Course(**payload.model_dump(), instructor_id=instructor.id)
    db.add(course)
    db.commit()
    db.refresh(course)
    return course


@router.get("/{course_id}/lessons", response_model=list[LessonRead])
def list_lessons(
    course_id: int, db: Session = Depends(db_session), _: User = Depends(current_user)
) -> list[Lesson]:
    return list(
        db.scalars(select(Lesson).where(Lesson.course_id == course_id).order_by(Lesson.position)).all()
    )


@router.post("/lessons", response_model=LessonRead, status_code=status.HTTP_201_CREATED)
def create_lesson(
    payload: LessonCreate,
    db: Session = Depends(db_session),
    _: User = Depends(instructor_user),
) -> Lesson:
    course = db.get(Course, payload.course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found.")
    lesson = Lesson(**payload.model_dump())
    db.add(lesson)
    db.commit()
    db.refresh(lesson)
    return lesson


@router.get("/lessons/{lesson_id}", response_model=LessonRead)
def get_lesson(
    lesson_id: int, db: Session = Depends(db_session), _: User = Depends(current_user)
) -> Lesson:
    lesson = db.get(Lesson, lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found.")
    return lesson


@router.post("/lessons/{lesson_id}/complete", status_code=status.HTTP_201_CREATED)
def complete_lesson(
    lesson_id: int, db: Session = Depends(db_session), student: User = Depends(current_user)
) -> dict[str, str]:
    if not db.get(Lesson, lesson_id):
        raise HTTPException(status_code=404, detail="Lesson not found.")
    db.add(ProgressEvent(student_id=student.id, lesson_id=lesson_id, event_type="lesson_completed"))
    db.commit()
    return {"status": "completed"}
