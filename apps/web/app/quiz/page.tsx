"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth";

type Quiz = {
  id: number;
  lesson_id: number;
  title: string;
  questions: Array<{
    prompt: string;
    question_type: string;
    options: string[];
    correct_answer: string;
    explanation: string;
  }>;
};

export default function QuizPage() {
  const { token } = useAuth();
  const [lessonId, setLessonId] = useState("1");
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const lesson = new URLSearchParams(window.location.search).get("lesson");
    if (lesson) {
      setLessonId(lesson);
    }
  }, []);

  async function generate() {
    if (!token) return;
    const nextQuiz = await apiFetch<Quiz>(`/quizzes/generate/${lessonId}`, { method: "POST", token });
    setQuiz(nextQuiz);
    setFeedback("");
  }

  async function submit() {
    if (!token || !quiz) return;
    const attempt = await apiFetch<{ score: number; feedback: string }>(`/quizzes/${quiz.id}/attempts`, {
      method: "POST",
      token,
      body: JSON.stringify({ answers })
    });
    setFeedback(`Score: ${attempt.score}%. ${attempt.feedback}`);
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <section className="card p-6">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-brand-600">Quiz practice</p>
        <h1 className="mt-3 text-4xl font-black text-slate-950">Generate an AI practice quiz.</h1>
        <div className="mt-6 flex flex-col gap-3 md:flex-row">
          <input className="input" value={lessonId} onChange={(event) => setLessonId(event.target.value)} placeholder="Lesson ID" />
          <button className="btn-primary" onClick={generate}>
            Generate
          </button>
        </div>
      </section>

      {quiz && (
        <section className="card mt-6 space-y-5 p-6">
          <h2 className="text-2xl font-black text-slate-950">{quiz.title}</h2>
          {quiz.questions.map((question, index) => (
            <div key={question.prompt} className="rounded-2xl border border-slate-200 p-4">
              <p className="font-bold text-slate-950">{question.prompt}</p>
              {question.options.length > 0 ? (
                <select className="input mt-3" value={answers[index] ?? ""} onChange={(event) => setAnswers({ ...answers, [index]: event.target.value })}>
                  <option value="">Select an answer</option>
                  {question.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <textarea className="input mt-3" value={answers[index] ?? ""} onChange={(event) => setAnswers({ ...answers, [index]: event.target.value })} />
              )}
            </div>
          ))}
          <button className="btn-primary" onClick={submit}>
            Submit Attempt
          </button>
          {feedback && <p className="rounded-xl bg-brand-50 p-4 font-bold text-brand-700">{feedback}</p>}
        </section>
      )}
    </main>
  );
}
