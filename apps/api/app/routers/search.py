from fastapi import APIRouter, Depends

from app.deps import current_user
from app.models import User
from app.schemas import SearchRequest, SearchResult
from app.services.rag import rag_service

router = APIRouter(prefix="/search", tags=["search"])


@router.post("", response_model=list[SearchResult])
def semantic_search(payload: SearchRequest, _: User = Depends(current_user)) -> list[SearchResult]:
    hits = rag_service.search(payload.query, payload.course_id, payload.limit)
    return [SearchResult(**hit.__dict__) for hit in hits]
