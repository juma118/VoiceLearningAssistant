import base64
from dataclasses import dataclass

import httpx
from anthropic import AsyncAnthropic
from langdetect import detect, LangDetectException
from openai import OpenAI

from app.core.config import get_settings


class ProviderNotConfigured(RuntimeError):
    pass


@dataclass
class LLMResult:
    answer: str
    suggested_followups: list[str]


class LanguageProvider:
    def detect_language(self, text: str) -> str:
        try:
            return detect(text)
        except LangDetectException:
            return "en"

    async def translate(self, text: str, target_language: str | None) -> str:
        if not target_language or target_language.lower().startswith("en"):
            return text
        settings = get_settings()
        if not settings.deepl_api_key:
            return text
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                "https://api-free.deepl.com/v2/translate",
                data={"auth_key": settings.deepl_api_key, "text": text, "target_lang": target_language.upper()},
            )
            response.raise_for_status()
            payload = response.json()
            return payload["translations"][0]["text"]


class EmbeddingProvider:
    def embed(self, texts: list[str]) -> list[list[float]]:
        settings = get_settings()
        if not settings.openai_api_key:
            return [self._deterministic_embedding(text) for text in texts]
        client = OpenAI(api_key=settings.openai_api_key)
        response = client.embeddings.create(model=settings.openai_embedding_model, input=texts)
        return [item.embedding for item in response.data]

    def _deterministic_embedding(self, text: str) -> list[float]:
        buckets = [0.0] * 64
        for index, char in enumerate(text.lower()):
            buckets[index % len(buckets)] += (ord(char) % 31) / 31
        length = sum(value * value for value in buckets) ** 0.5 or 1.0
        return [value / length for value in buckets]


class LLMProvider:
    async def answer(self, question: str, context: str) -> LLMResult:
        settings = get_settings()
        prompt = (
            "You are a patient programming tutor. Explain clearly, use course context, "
            "include a small example when useful, and end with next practice steps.\n\n"
            f"Course context:\n{context or 'No matching course context was found.'}\n\n"
            f"Student question:\n{question}"
        )
        if settings.openai_api_key:
            client = OpenAI(api_key=settings.openai_api_key)
            response = client.chat.completions.create(
                model=settings.openai_chat_model,
                messages=[
                    {"role": "system", "content": "You are an expert programming tutor for students."},
                    {"role": "user", "content": prompt},
                ],
                temperature=0.3,
            )
            answer = response.choices[0].message.content or ""
            return LLMResult(answer=answer, suggested_followups=self._followups(question))
        if settings.anthropic_api_key:
            client = AsyncAnthropic(api_key=settings.anthropic_api_key)
            response = await client.messages.create(
                model=settings.anthropic_model,
                max_tokens=1200,
                system="You are an expert programming tutor for students.",
                messages=[{"role": "user", "content": prompt}],
            )
            answer = "\n".join(block.text for block in response.content if block.type == "text")
            return LLMResult(answer=answer, suggested_followups=self._followups(question))
        return self._fallback_answer(question, context)

    def _fallback_answer(self, question: str, context: str) -> LLMResult:
        answer = self._local_tutor_answer(question, context)
        return LLMResult(answer=answer, suggested_followups=self._followups(question))

    def _local_tutor_answer(self, question: str, context: str) -> str:
        lowered = question.lower()
        if "github" in lowered and "user" in lowered:
            return (
                "Yes. For a quick test, GitHub has public REST endpoints you can call without building "
                "your own backend first.\n\n"
                "To list public GitHub users, call:\n\n"
                "```http\nGET https://api.github.com/users?per_page=10\n```\n\n"
                "To search users by a keyword, call:\n\n"
                "```http\nGET https://api.github.com/search/users?q=juan&per_page=10\n```\n\n"
                "In JavaScript, the basic pattern is:\n\n"
                "```js\nconst response = await fetch('https://api.github.com/users?per_page=10');\n"
                "const users = await response.json();\nconsole.log(users);\n```\n\n"
                "If you make many requests, add a GitHub token in the `Authorization` header because "
                "unauthenticated requests have a lower rate limit."
            )
        if "api" in lowered or "rest" in lowered:
            return (
                "An API is a contract that lets one program ask another program for data or actions. "
                "For REST APIs, the client sends an HTTP request to a URL, and the server returns data, "
                "usually JSON.\n\n"
                "Example flow:\n\n"
                "```http\nGET /users\n```\n\n"
                "The server might respond with:\n\n"
                "```json\n[{ \"id\": 1, \"name\": \"Ada\" }]\n```\n\n"
                "Common methods are `GET` to read data, `POST` to create data, `PUT/PATCH` to update, "
                "and `DELETE` to remove. If you get a `401`, check your auth token or login session."
            )
        if context:
            return (
                "Here is a course-aware explanation based on the available lesson material.\n\n"
                f"{context[:900]}\n\n"
                "The key idea is to connect the concept to a small example, then practice it with one "
                "focused question. Ask me for a code example if you want to go deeper."
            )
        return (
            "I do not have a matching course source for this exact question yet, but I can still help.\n\n"
            f"Your question: {question}\n\n"
            "A good way to approach this is:\n\n"
            "1. Identify the concept or error message.\n"
            "2. Write the smallest possible example.\n"
            "3. Check inputs, expected output, and any authentication or configuration.\n"
            "4. Test one change at a time.\n\n"
            "If you share the language, framework, or error text, I can give a more specific answer."
        )

    def _followups(self, question: str) -> list[str]:
        return [
            "Can you show me a simple code example?",
            "What common mistakes should I avoid?",
            f"Can I practice a quiz question about {question[:40]}?",
        ]


class VoiceProvider:
    async def transcribe(self, raw_audio: bytes, filename: str | None = None) -> tuple[str, str]:
        if not raw_audio:
            return "", "en"
        # FastWhisper normally runs as a worker/service. This adapter keeps the endpoint contract ready.
        return (
            f"Transcription placeholder for {filename or 'audio upload'}. Configure FastWhisper worker for live STT.",
            "en",
        )

    async def synthesize(self, text: str, voice_id: str | None = None) -> str | None:
        settings = get_settings()
        if not settings.elevenlabs_api_key:
            return None
        selected_voice = voice_id or settings.elevenlabs_voice_id
        async with httpx.AsyncClient(timeout=60) as client:
            response = await client.post(
                f"https://api.elevenlabs.io/v1/text-to-speech/{selected_voice}",
                headers={
                    "xi-api-key": settings.elevenlabs_api_key,
                    "accept": "audio/mpeg",
                    "content-type": "application/json",
                },
                json={"text": text, "model_id": "eleven_multilingual_v2"},
            )
            response.raise_for_status()
            return base64.b64encode(response.content).decode("utf-8")


language_provider = LanguageProvider()
embedding_provider = EmbeddingProvider()
llm_provider = LLMProvider()
voice_provider = VoiceProvider()
