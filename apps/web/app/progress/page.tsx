"use client";

import { useEffect, useState } from "react";
import { StatCard } from "@/components/stat-card";
import { getProgress } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { ProgressSummary } from "@/lib/types";

export default function ProgressPage() {
  const { token } = useAuth();
  const [progress, setProgress] = useState<ProgressSummary | null>(null);

  useEffect(() => {
    if (token) {
      getProgress(token).then(setProgress).catch(() => undefined);
    }
  }, [token]);

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <p className="text-sm font-bold uppercase tracking-[0.25em] text-brand-600">Progress analytics</p>
      <h1 className="mt-3 text-4xl font-black text-slate-950">Track your learning signals.</h1>
      <section className="mt-8 grid gap-5 md:grid-cols-3">
        <StatCard label="Completed" value={progress?.completed_lessons ?? 0} detail="Completed lesson events" />
        <StatCard label="Average Score" value={`${Math.round(progress?.average_score ?? 0)}%`} detail="Across quiz attempts" />
        <StatCard label="Recommendations" value={progress?.recommendations.length ?? 0} detail="Personalized next steps" />
      </section>
      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="text-2xl font-black text-slate-950">Weak Topics</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {(progress?.weak_topics ?? []).map((topic) => (
              <span key={topic} className="rounded-full bg-red-50 px-4 py-2 text-sm font-bold text-red-700">
                {topic}
              </span>
            ))}
          </div>
        </div>
        <div className="card p-6">
          <h2 className="text-2xl font-black text-slate-950">Recommendations</h2>
          <div className="mt-4 space-y-3">
            {(progress?.recommendations ?? []).map((item, index) => (
              <div key={index} className="rounded-2xl bg-slate-50 p-4">
                <p className="font-bold text-slate-950">{String(item.topic)}</p>
                <p className="text-sm text-slate-600">{String(item.reason)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
