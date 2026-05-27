# API Workflow

## Assistant

`POST /assistant/chat`

Request:

```json
{
  "message": "Explain REST APIs with a Python example",
  "course_id": 1,
  "lesson_id": 2,
  "target_language": "en",
  "include_audio": true
}
```

Response includes the generated answer, citations, suggested follow-up questions, conversation id, detected language, and optional audio.

## Ingestion

`POST /content/resources`

Instructors upload or paste material. The API stores metadata in Postgres, chunks the content, embeds it, and upserts the chunks into Chroma.

## Semantic Search

`POST /search`

The API embeds the query and searches course material by semantic similarity. Results include source title, lesson id, snippet, and score.

## Quiz Generation

`POST /quizzes/generate`

The API uses lesson content and weak-topic history to produce multiple-choice and coding questions. Attempts are persisted through `POST /quizzes/{quiz_id}/attempts`.
