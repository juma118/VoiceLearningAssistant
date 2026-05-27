from dataclasses import dataclass
from math import sqrt
from typing import Any

import chromadb

from app.core.config import get_settings
from app.models import Resource
from app.services.providers import embedding_provider


@dataclass
class RagHit:
    resource_id: int | None
    lesson_id: int | None
    title: str
    snippet: str
    score: float
    metadata: dict[str, Any]


class RagService:
    def __init__(self) -> None:
        self._fallback_chunks: list[dict[str, Any]] = []

    def _collection(self):
        settings = get_settings()
        client = chromadb.HttpClient(host=settings.chroma_host, port=settings.chroma_port)
        return client.get_or_create_collection(settings.chroma_collection)

    def chunk_text(self, text: str, chunk_size: int = 900, overlap: int = 120) -> list[str]:
        clean = " ".join(text.split())
        if not clean:
            return []
        chunks: list[str] = []
        start = 0
        while start < len(clean):
            chunks.append(clean[start : start + chunk_size])
            start += chunk_size - overlap
        return chunks

    def index_resource(self, resource: Resource) -> None:
        chunks = self.chunk_text(resource.content)
        if not chunks:
            return
        embeddings = embedding_provider.embed(chunks)
        ids = [f"resource-{resource.id}-{index}" for index in range(len(chunks))]
        metadatas = [
            {
                "resource_id": resource.id,
                "lesson_id": resource.lesson_id,
                "course_id": resource.course_id,
                "title": resource.title,
            }
            for _ in chunks
        ]
        try:
            self._collection().upsert(ids=ids, documents=chunks, embeddings=embeddings, metadatas=metadatas)
        except Exception:
            self._fallback_chunks = [
                chunk for chunk in self._fallback_chunks if chunk["metadata"]["resource_id"] != resource.id
            ]
            self._fallback_chunks.extend(
                {"id": chunk_id, "document": doc, "embedding": emb, "metadata": meta}
                for chunk_id, doc, emb, meta in zip(ids, chunks, embeddings, metadatas, strict=True)
            )

    def search(self, query: str, course_id: int | None = None, limit: int = 5) -> list[RagHit]:
        query_embedding = embedding_provider.embed([query])[0]
        where = {"course_id": course_id} if course_id else None
        try:
            results = self._collection().query(
                query_embeddings=[query_embedding],
                n_results=limit,
                where=where,
                include=["documents", "metadatas", "distances"],
            )
            hits: list[RagHit] = []
            for doc, meta, distance in zip(
                results.get("documents", [[]])[0],
                results.get("metadatas", [[]])[0],
                results.get("distances", [[]])[0],
                strict=False,
            ):
                hits.append(
                    RagHit(
                        resource_id=meta.get("resource_id"),
                        lesson_id=meta.get("lesson_id"),
                        title=meta.get("title", "Course material"),
                        snippet=doc,
                        score=max(0.0, 1.0 - float(distance)),
                        metadata=meta,
                    )
                )
            return hits
        except Exception:
            return self._fallback_search(query_embedding, course_id, limit)

    def _fallback_search(
        self, query_embedding: list[float], course_id: int | None, limit: int
    ) -> list[RagHit]:
        scored: list[tuple[float, dict[str, Any]]] = []
        for chunk in self._fallback_chunks:
            if course_id and chunk["metadata"].get("course_id") != course_id:
                continue
            scored.append((self._cosine(query_embedding, chunk["embedding"]), chunk))
        scored.sort(key=lambda item: item[0], reverse=True)
        return [
            RagHit(
                resource_id=chunk["metadata"].get("resource_id"),
                lesson_id=chunk["metadata"].get("lesson_id"),
                title=chunk["metadata"].get("title", "Course material"),
                snippet=chunk["document"],
                score=score,
                metadata=chunk["metadata"],
            )
            for score, chunk in scored[:limit]
        ]

    def _cosine(self, left: list[float], right: list[float]) -> float:
        numerator = sum(a * b for a, b in zip(left, right, strict=False))
        left_norm = sqrt(sum(a * a for a in left)) or 1.0
        right_norm = sqrt(sum(b * b for b in right)) or 1.0
        return numerator / (left_norm * right_norm)


rag_service = RagService()
