from functools import lru_cache
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "Voice Learning Assistant API"
    environment: Literal["development", "test", "production"] = "development"
    api_prefix: str = ""
    secret_key: str = Field(default="change-me-in-production")
    access_token_expire_minutes: int = 60 * 24
    cors_origins: str = "http://localhost:3000"

    database_url: str = "sqlite:///./voice_learning.db"
    redis_url: str = "redis://localhost:6379/0"

    chroma_host: str = "localhost"
    chroma_port: int = 8001
    chroma_collection: str = "course_materials"

    openai_api_key: str | None = None
    openai_chat_model: str = "gpt-4o-mini"
    openai_embedding_model: str = "text-embedding-3-small"
    anthropic_api_key: str | None = None
    anthropic_model: str = "claude-3-5-sonnet-latest"
    elevenlabs_api_key: str | None = None
    elevenlabs_voice_id: str = "Rachel"
    deepl_api_key: str | None = None

    upload_dir: str = "uploads"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
