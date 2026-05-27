"use client";

import { useEffect, useState } from "react";
import { StatCard } from "@/components/stat-card";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth";

type Analytics = {
  active_students: number;
  total_questions: number;
  difficult_lessons: Array<Record<string, unknown>>;
  weak_topics: Array<{ topic: string; count: number }>;
  recent_questions: Array<Record<string, unknown>>;
};

export default function InstructorPage() {
  const { token } = useAuth();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  useEffect(() => {
    if (token) {
      apiFetch<Analytics>("/instructor/analytics", { token }).then(setAnalytics).catch(() => undefined);
    }
  }, [token]);

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <p className="text-sm font-bold uppercase tracking-[0.25em] text-brand-600">Instructor dashboard</p>
      <h1 className="mt-3 text-4xl font-black text-slate-950">Class-level learning intelligence.</h1>
      <section className="mt-8 grid gap-5 md:grid-cols-3">
        <StatCard label="Active Students" value={analytics?.active_students ?? 0} detail="Registered learners" />
        <StatCard label="Student Questions" value={analytics?.total_questions ?? 0} detail="Asked through the tutor" />
        <StatCard label="Weak Topics" value={analytics?.weak_topics.length ?? 0} detail="Detected from activity" />
      </section>
      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="text-2xl font-black text-slate-950">Difficult Lessons</h2>
          <div className="mt-4 space-y-3">
            {(analytics?.difficult_lessons ?? []).map((lesson, index) => (
              <div key={index} className="rounded-2xl bg-slate-50 p-4">
                <p className="font-bold text-slate-950">{String(lesson.title)}</p>
                <p className="text-sm text-slate-600">{String(lesson.signal)}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-6">
          <h2 className="text-2xl font-black text-slate-950">Most Asked Topics</h2>
          <div className="mt-4 space-y-3">
            {(analytics?.weak_topics ?? []).map((topic) => (
              <div key={topic.topic} className="flex justify-between rounded-2xl bg-brand-50 p-4 font-bold text-brand-700">
                <span>{topic.topic}</span>
                <span>{topic.count}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
