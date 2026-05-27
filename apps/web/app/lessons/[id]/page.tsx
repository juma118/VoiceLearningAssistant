"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getLesson } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Lesson } from "@/lib/types";

export default function LessonDetailPage({ params }: { params: { id: string } }) {
  const { token } = useAuth();
  const [lesson, setLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    if (!token) return;
    getLesson(token, Number(params.id)).then(setLesson).catch(() => undefined);
  }, [params.id, token]);

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      {lesson ? (
        <article className="card p-8">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-brand-600">Lesson detail</p>
          <h1 className="mt-3 text-4xl font-black text-slate-950">{lesson.title}</h1>
          <p className="mt-4 rounded-2xl bg-brand-50 p-4 font-semibold text-brand-700">{lesson.summary}</p>
          <div className="prose prose-slate mt-8 max-w-none whitespace-pre-wrap text-slate-700">{lesson.content}</div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="btn-primary" href={`/assistant?lesson=${lesson.id}`}>
              Ask About This Topic
            </Link>
            <Link className="btn-secondary" href={`/quiz?lesson=${lesson.id}`}>
              Generate Quiz
            </Link>
          </div>
        </article>
      ) : (
        <div className="card p-8 text-slate-600">Loading lesson...</div>
      )}
    </main>
  );
}
