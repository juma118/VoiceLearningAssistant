from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.deps import current_user, db_session, instructor_user
from app.models import Resource, ResourceType, User
from app.schemas import ResourceCreate, ResourceRead
from app.services.rag import rag_service

router = APIRouter(prefix="/content", tags=["content"])


@router.get("/resources", response_model=list[ResourceRead])
def list_resources(
    course_id: int | None = None,
    db: Session = Depends(db_session),
    _: User = Depends(current_user),
) -> list[Resource]:
    statement = select(Resource).order_by(Resource.created_at.desc())
    if course_id:
        statement = statement.where(Resource.course_id == course_id)
    return list(db.scalars(statement).all())


@router.post("/resources", response_model=ResourceRead, status_code=status.HTTP_201_CREATED)
def create_resource(
    payload: ResourceCreate,
    db: Session = Depends(db_session),
    _: User = Depends(instructor_user),
) -> Resource:
    resource = Resource(**payload.model_dump())
    db.add(resource)
    db.commit()
    db.refresh(resource)
    rag_service.index_resource(resource)
    return resource


@router.post("/upload", response_model=ResourceRead, status_code=status.HTTP_201_CREATED)
async def upload_resource(
    course_id: int = Form(...),
    lesson_id: int | None = Form(None),
    title: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(db_session),
    _: User = Depends(instructor_user),
) -> Resource:
    raw = await file.read()
    try:
        content = raw.decode("utf-8")
    except UnicodeDecodeError as exc:
        raise HTTPException(status_code=400, detail="Only text-readable files are supported.") from exc

    resource_type = ResourceType.markdown if file.filename.endswith(".md") else ResourceType.text
    resource = Resource(
        course_id=course_id,
        lesson_id=lesson_id,
        title=title,
        resource_type=resource_type,
        content=content,
        source_url=file.filename,
    )
    db.add(resource)
    db.commit()
    db.refresh(resource)
    rag_service.index_resource(resource)
    return resource
