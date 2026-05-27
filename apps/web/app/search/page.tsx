"use client";

import { FormEvent, useState } from "react";
import { semanticSearch } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { SearchResult } from "@/lib/types";

export default function SearchPage() {
  const { token } = useAuth();
  const [query, setQuery] = useState("how APIs connect apps");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!token) {
      setError("Login first to search course materials.");
      return;
    }
    setError("");
    try {
      setResults(await semanticSearch(token, query));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Search failed");
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <section className="card p-6">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-brand-600">Semantic search</p>
        <h1 className="mt-3 text-4xl font-black text-slate-950">Search by meaning, not only keywords.</h1>
        <form className="mt-6 flex flex-col gap-3 md:flex-row" onSubmit={onSubmit}>
          <input className="input" value={query} onChange={(event) => setQuery(event.target.value)} />
          <button className="btn-primary" type="submit">
            Search
          </button>
        </form>
        {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
      </section>

      <section className="mt-6 space-y-4">
        {results.map((result, index) => (
          <article key={`${result.title}-${index}`} className="card p-5">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-black text-slate-950">{result.title}</h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-600">
                {Math.round(result.score * 100)}%
              </span>
            </div>
            <p className="mt-3 leading-7 text-slate-600">{result.snippet}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
