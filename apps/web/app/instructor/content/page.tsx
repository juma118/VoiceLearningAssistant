"use client";

import { FormEvent, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function ContentManagementPage() {
  const { token } = useAuth();
  const [courseId, setCourseId] = useState("1");
  const [lessonId, setLessonId] = useState("1");
  const [title, setTitle] = useState("New Course Resource");
  const [content, setContent] = useState("Paste notes, examples, or lesson content here for RAG indexing.");
  const [status, setStatus] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!token) return;
    setStatus("Saving and indexing...");
    try {
      await apiFetch("/content/resources", {
        method: "POST",
        token,
        body: JSON.stringify({
          course_id: Number(courseId),
          lesson_id: lessonId ? Number(lessonId) : null,
          title,
          content,
          resource_type: "text"
        })
      });
      setStatus("Resource saved and queued for semantic search.");
    } catch (caught) {
      setStatus(caught instanceof Error ? caught.message : "Unable to save resource.");
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <section className="card p-6">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-brand-600">Content management</p>
        <h1 className="mt-3 text-4xl font-black text-slate-950">Upload and index course material.</h1>
        <form className="mt-6 space-y-4" onSubmit={submit}>
          <div className="grid gap-4 md:grid-cols-2">
            <input className="input" value={courseId} onChange={(event) => setCourseId(event.target.value)} placeholder="Course ID" />
            <input className="input" value={lessonId} onChange={(event) => setLessonId(event.target.value)} placeholder="Lesson ID" />
          </div>
          <input className="input" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Resource title" />
          <textarea className="input min-h-60" value={content} onChange={(event) => setContent(event.target.value)} />
          <button className="btn-primary" type="submit">
            Save Resource
          </button>
        </form>
        {status && <p className="mt-4 rounded-xl bg-slate-100 p-4 font-semibold text-slate-700">{status}</p>}
      </section>
    </main>
  );
}
