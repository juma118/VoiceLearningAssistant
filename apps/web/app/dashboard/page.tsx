"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { StatCard } from "@/components/stat-card";
import { getCourses, getLessons, getProgress } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Course, Lesson, ProgressSummary } from "@/lib/types";

export default function DashboardPage() {
  const { token, user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<ProgressSummary | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    Promise.all([
      getCourses(token).then(async (items) => {
        setCourses(items);
        if (items[0]) {
          setLessons(await getLessons(token, items[0].id));
        }
      }),
      getProgress(token).then(setProgress).catch(() => undefined)
    ]).finally(() => setLoading(false));
  }, [token]);

  if (!token) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-10">
        <section className="hero-panel grid gap-8 p-8 md:grid-cols-[1.1fr_0.9fr] md:p-10">
          <div className="relative z-10">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-mint-100">Student workspace</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-tight md:text-6xl">
              Your AI learning dashboard is ready.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-mint-50">
              Log in to see courses, recommendations, quiz progress, weak topics, and voice tutor activity.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link className="rounded-full bg-white px-5 py-3 font-black text-brand-700 shadow-xl shadow-green-950/20 transition hover:-translate-y-0.5" href="/login">
                Login to Continue
              </Link>
              <Link className="rounded-full border border-white/25 bg-white/10 px-5 py-3 font-black text-white backdrop-blur transition hover:bg-white/20" href="/assistant">
                Preview Assistant
              </Link>
            </div>
          </div>
          <div className="relative z-10 grid gap-4 sm:grid-cols-2">
            {["Voice tutoring", "Semantic search", "Quiz practice", "Progress insights"].map((item) => (
              <div key={item} className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur">
                <p className="text-sm font-black text-white">{item}</p>
                <p className="mt-2 text-sm leading-6 text-mint-50">Personalized learning data appears here after login.</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <section className="hero-panel p-8 md:p-10">
        <div className="relative z-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-mint-100">Student dashboard</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-tight md:text-6xl">
              Welcome back, {user?.full_name?.split(" ")[0] ?? "learner"}.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-mint-50">
              Continue your programming path with grounded AI explanations, voice practice, and recommendations based on your learning signals.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link className="rounded-full bg-white px-5 py-3 font-black text-brand-700 shadow-xl shadow-green-950/20 transition hover:-translate-y-0.5" href="/assistant">
                Ask by Voice
              </Link>
              <Link className="rounded-full border border-white/25 bg-white/10 px-5 py-3 font-black text-white backdrop-blur transition hover:bg-white/20" href="/search">
                Search Lessons
              </Link>
            </div>
          </div>
          <div className="rounded-[1.75rem] border border-white/15 bg-white/10 p-5 backdrop-blur">
            <p className="text-sm font-black text-mint-50">Today&apos;s focus</p>
            <div className="mt-4 space-y-3">
              {["Ask one concept question by voice", "Review recommended lessons", "Complete a short practice quiz"].map((item, index) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/10 p-3">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-sm font-black text-brand-700">
                    {index + 1}
                  </span>
                  <span className="text-sm font-bold text-white">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-3">
        <StatCard label="Completed Lessons" value={progress?.completed_lessons ?? 0} detail="Tracked from lesson activity and practice sessions." accent="blue" />
        <StatCard label="Average Quiz Score" value={`${Math.round(progress?.average_score ?? 0)}%`} detail="Updated after each generated quiz attempt." accent="green" />
        <StatCard label="Weak Topics" value={progress?.weak_topics.length ?? 0} detail="Used to personalize your recommendations." accent="amber" />
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="card p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="section-kicker">Learning path</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">Current Courses</h2>
            </div>
            {loading && <span className="rounded-full bg-mint-100 px-3 py-1 text-sm font-bold text-brand-700">Loading</span>}
          </div>
          <div className="mt-6 space-y-4">
            {courses.map((course) => (
              <div key={course.id} className="group rounded-3xl border border-brand-100/80 bg-white/70 p-5 transition hover:-translate-y-1 hover:border-brand-100 hover:shadow-xl hover:shadow-green-950/5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">{course.level}</p>
                    <h3 className="mt-2 text-xl font-black text-slate-950">{course.title}</h3>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{course.description}</p>
                  </div>
                  <Link className="btn-secondary shrink-0 py-2 text-sm" href="/assistant">
                    Study
                  </Link>
                </div>
              </div>
            ))}
            {!loading && courses.length === 0 && (
              <div className="rounded-3xl border border-dashed border-brand-100 bg-mint-50/70 p-8 text-center">
                <p className="font-black text-slate-950">No courses loaded yet.</p>
                <p className="mt-2 text-sm text-slate-600">Seed data appears after the API is running and you are logged in.</p>
              </div>
            )}
          </div>
        </div>
        <div className="card p-7">
          <p className="section-kicker">Next best action</p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">Recommended Lessons</h2>
          <div className="mt-6 space-y-3">
            {lessons.map((lesson) => (
              <Link key={lesson.id} href={`/lessons/${lesson.id}`} className="group block rounded-3xl border border-brand-100/70 bg-mint-50/80 p-5 transition hover:-translate-y-1 hover:bg-brand-50 hover:shadow-xl hover:shadow-green-950/5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-slate-950">{lesson.title}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{lesson.summary}</p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-brand-700 shadow-sm">
                    {lesson.estimated_minutes}m
                  </span>
                </div>
              </Link>
            ))}
            {!loading && lessons.length === 0 && (
              <div className="rounded-3xl border border-dashed border-brand-100 bg-mint-50/70 p-8 text-center">
                <p className="font-black text-slate-950">Recommendations are waiting.</p>
                <p className="mt-2 text-sm text-slate-600">Ask the tutor or complete a quiz to generate learning signals.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
