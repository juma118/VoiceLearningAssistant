"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { login, register } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Role } from "@/lib/types";

export default function LoginPage() {
  const router = useRouter();
  const { setSession } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("student@example.com");
  const [password, setPassword] = useState("password123");
  const [fullName, setFullName] = useState("Student Demo");
  const [role, setRole] = useState<Role>("student");
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      const session =
        mode === "login"
          ? await login(email, password)
          : await register(fullName, email, password, role);
      setSession(session.access_token, session.user);
      router.push(session.user.role === "instructor" ? "/instructor" : "/dashboard");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to authenticate");
    }
  }

  return (
    <main className="mx-auto grid min-h-[calc(100vh-73px)] max-w-6xl gap-10 px-6 py-12 lg:grid-cols-2 lg:items-center">
      <section>
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-brand-600">Role-based access</p>
        <h1 className="mt-4 text-5xl font-black text-slate-950">Welcome back to VoiceLearn AI.</h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">
          Use the seeded student or instructor account, or register a new demo user to explore the
          dashboards.
        </p>
        <div className="mt-6 rounded-2xl bg-slate-950 p-5 text-sm text-white">
          Student: student@example.com / password123
          <br />
          Instructor: instructor@example.com / password123
        </div>
      </section>

      <form className="card space-y-4 p-6" onSubmit={onSubmit}>
        <div className="flex gap-2 rounded-full bg-slate-100 p-1">
          {(["login", "register"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setMode(item)}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-bold ${
                mode === item ? "bg-white text-brand-700 shadow" : "text-slate-500"
              }`}
            >
              {item === "login" ? "Login" : "Register"}
            </button>
          ))}
        </div>
        {mode === "register" && (
          <>
            <input className="input" value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Full name" />
            <select className="input" value={role} onChange={(event) => setRole(event.target.value as Role)}>
              <option value="student">Student</option>
              <option value="instructor">Instructor</option>
            </select>
          </>
        )}
        <input className="input" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" type="email" />
        <input className="input" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" type="password" />
        {error && <p className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
        <button className="btn-primary w-full" type="submit">
          Continue
        </button>
      </form>
    </main>
  );
}
