"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";

const studentLinks = [
  ["Dashboard", "/dashboard"],
  ["Assistant", "/assistant"],
  ["Search", "/search"],
  ["Quiz", "/quiz"],
  ["Progress", "/progress"]
];

const instructorLinks = [
  ["Instructor", "/instructor"],
  ["Content", "/instructor/content"]
];

export function Nav() {
  const { user, logout } = useAuth();
  const links = user?.role === "instructor" ? instructorLinks : studentLinks;

  return (
    <header className="sticky top-0 z-30 border-b border-brand-600/15 bg-gradient-to-b from-sage-300 via-mint-100 to-mint-50 shadow-lg shadow-green-900/10">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <Link href="/" className="wordmark group">
          <span className="wordmark-signal" />
          <span className="wordmark-text">
            VoiceLearn <span>AI</span>
          </span>
        </Link>
        <div className="hidden items-center gap-1 rounded-full border border-white/55 bg-white/55 p-1 text-sm font-bold text-ink shadow-sm shadow-green-900/5 backdrop-blur md:flex">
          {user &&
            links.map(([label, href]) => (
              <Link key={href} href={href} className="rounded-full px-4 py-2 hover:bg-white/90 hover:text-brand-700 hover:shadow-sm">
                {label}
              </Link>
            ))}
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden rounded-full border border-white/50 bg-white/60 px-3 py-2 text-sm font-black text-brand-700 shadow-sm shadow-green-900/5 backdrop-blur sm:inline">
                {user.full_name}
              </span>
              <button className="rounded-full border border-white/55 bg-white/70 px-4 py-2 text-sm font-black text-ink shadow-sm shadow-green-900/5 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <Link className="rounded-full border border-white/50 bg-white/70 px-4 py-2 text-sm font-black text-brand-700 shadow-sm shadow-green-900/5 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white" href="/login">
              Login
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
