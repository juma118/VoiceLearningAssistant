from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models import QuestionType, ResourceType, UserRole


class UserCreate(BaseModel):
    email: EmailStr
    full_name: str = Field(min_length=2)
    password: str = Field(min_length=8)
    role: UserRole = UserRole.student


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    full_name: str
    role: UserRole
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class CourseCreate(BaseModel):
    title: str
    description: str
    level: str = "Beginner"


class CourseRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str
    level: str
    instructor_id: int | None


class LessonCreate(BaseModel):
    course_id: int
    title: str
    slug: str
    content: str
    summary: str = ""
    position: int = 0
    estimated_minutes: int = 20


class LessonRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    course_id: int
    title: str
    slug: str
    content: str
    summary: str
    position: int
    estimated_minutes: int


class ResourceCreate(BaseModel):
    course_id: int
    lesson_id: int | None = None
    title: str
    resource_type: ResourceType = ResourceType.text
    content: str
    source_url: str | None = None


class ResourceRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    course_id: int
    lesson_id: int | None
    title: str
    resource_type: ResourceType
    source_url: str | None


class SearchRequest(BaseModel):
    query: str
    course_id: int | None = None
    limit: int = 5


class SearchResult(BaseModel):
    resource_id: int | None = None
    lesson_id: int | None = None
    title: str
    snippet: str
    score: float
    metadata: dict[str, Any] = Field(default_factory=dict)


class AssistantRequest(BaseModel):
    message: str
    conversation_id: int | None = None
    course_id: int | None = None
    lesson_id: int | None = None
    target_language: str | None = None
    include_audio: bool = False


class AssistantResponse(BaseModel):
    conversation_id: int
    answer: str
    detected_language: str
    citations: list[SearchResult]
    suggested_followups: list[str]
    audio_base64: str | None = None


class TranscriptionResponse(BaseModel):
    text: str
    language: str


class TTSRequest(BaseModel):
    text: str
    voice_id: str | None = None


class TTSResponse(BaseModel):
    audio_base64: str
    content_type: str = "audio/mpeg"


class QuizQuestion(BaseModel):
    prompt: str
    question_type: QuestionType
    options: list[str] = Field(default_factory=list)
    correct_answer: str
    explanation: str


class QuizRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    lesson_id: int
    title: str
    questions: list[dict[str, Any]]


class QuizAttemptCreate(BaseModel):
    answers: dict[str, Any]


class QuizAttemptRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    quiz_id: int
    student_id: int
    score: float
    feedback: str


class ProgressSummary(BaseModel):
    completed_lessons: int
    average_score: float
    weak_topics: list[str]
    recent_activity: list[dict[str, Any]]
    recommendations: list[dict[str, Any]]


class InstructorAnalytics(BaseModel):
    active_students: int
    total_questions: int
    difficult_lessons: list[dict[str, Any]]
    weak_topics: list[dict[str, Any]]
    recent_questions: list[dict[str, Any]]
