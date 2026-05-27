# Voice-Enabled Learning Assistant

A production-style full-stack AI learning platform for voice tutoring, RAG search, multilingual explanations, quizzes, and instructor analytics.

## Stack

- Frontend: Next.js, TypeScript, Tailwind CSS
- Backend: FastAPI, SQLAlchemy, Alembic, PostgreSQL, Redis
- AI: OpenAI/Anthropic compatible LLM adapters, OpenAI embeddings, Chroma vector search
- Voice: FastWhisper transcription adapter, ElevenLabs TTS adapter
- Translation: DeepL adapter
- DevOps: Docker Compose, nginx profile, GitHub Actions

## Quick Start

1. Copy environment files:

   ```bash
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env.local
   ```

2. Add provider keys to `apps/api/.env` as needed.

3. Start the stack:

   ```bash
   docker compose up --build
   ```

4. Open:

   - Web: http://localhost:3000
   - API docs: http://localhost:8000/docs
   - Chroma: http://localhost:8001

## Demo Accounts

The seed command creates:

- Student: `student@example.com` / `password123`
- Instructor: `instructor@example.com` / `password123`

## Local Development

Backend:

```bash
cd apps/api
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
alembic upgrade head
python -m app.seed
uvicorn app.main:app --reload
```

Frontend:

```bash
cd apps/web
npm install
npm run dev
```

## Checks

```bash
cd apps/api && pytest
cd apps/web && npm run lint && npm run typecheck && npm run build
```

## Notes

Provider integrations are isolated behind service adapters. If keys are missing, the API returns clear provider setup errors while still allowing the rest of the app to run with seeded demo data.
