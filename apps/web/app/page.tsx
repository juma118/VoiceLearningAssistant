import Link from "next/link";

const learningSignals = [
  { label: "Voice questions", value: "1,248", tone: "bg-mint-100 text-brand-700" },
  { label: "Weak topics found", value: "36", tone: "bg-blush-100 text-rose-700" },
  { label: "Lesson sources", value: "512", tone: "bg-white/70 text-ink" }
];

const workflow = [
  "Student speaks",
  "Whisper transcribes",
  "Course memory searches",
  "Tutor explains",
  "Progress updates"
];

const studioCards = [
  {
    title: "Voice Tutor",
    body: "A student asks a programming question naturally. The answer comes back as text, audio, sources, and follow-up prompts.",
    accent: "from-sage-300 to-mint-100"
  },
  {
    title: "Course Memory",
    body: "Lessons, PDFs, notes, and code snippets become searchable context instead of static files.",
    accent: "from-mint-100 to-white"
  },
  {
    title: "Instructor Radar",
    body: "Repeated questions, weak topics, and quiz outcomes turn into class-level signals for instructors.",
    accent: "from-blush-300 to-blush-100"
  }
];

const stack = ["FastWhisper", "RAG", "OpenAI", "Anthropic", "ElevenLabs", "DeepL", "Chroma", "Postgres"];

export default function LandingPage() {
  return (
    <main className="page-shell overflow-hidden">
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="animate-rise relative rounded-[2.5rem] border border-white/70 bg-white/45 p-4 shadow-2xl shadow-green-950/10 backdrop-blur">
          <div className="absolute inset-x-10 top-0 h-24 rounded-full bg-blush-300/30 blur-3xl" />
          <div className="relative grid min-h-[680px] gap-4 lg:grid-cols-[0.75fr_1.35fr_0.8fr]">
            <aside className="animate-slide-left flex flex-col gap-4">
              <div className="rounded-[2rem] bg-sage-300 p-6 shadow-xl shadow-green-950/10">
                <p className="text-xs font-black uppercase tracking-[0.28em] text-brand-700">Live class pulse</p>
                <div className="mt-8 space-y-4">
                  {learningSignals.map((signal) => (
                    <div key={signal.label} className={`rounded-3xl p-4 ${signal.tone}`}>
                      <p className="text-3xl font-black">{signal.value}</p>
                      <p className="mt-1 text-sm font-bold">{signal.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-6">
                <p className="section-kicker">Not a chatbot</p>
                <h2 className="mt-3 text-2xl font-black text-ink">A course-aware study room.</h2>
                <p className="mt-3 text-sm leading-7 text-slate-700">
                  The tutor listens, searches the course, explains with sources, speaks back, and
                  turns confusion into practice.
                </p>
              </div>
            </aside>

            <section className="relative z-20 flex items-center justify-center overflow-hidden rounded-[2.25rem] bg-gradient-to-b from-mint-50 via-mint-100 to-blush-100 p-6 shadow-2xl shadow-green-950/10">
              <div className="absolute left-8 top-8 rounded-full bg-white/70 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-brand-700 shadow-sm">
                Voice-enabled learning assistant
              </div>
              <div className="absolute inset-x-8 top-24 flex justify-between text-xs font-black text-brand-700/70">
                {workflow.map((step) => (
                  <span key={step} className="hidden rounded-full bg-white/55 px-3 py-2 shadow-sm backdrop-blur md:inline">
                    {step}
                  </span>
                ))}
              </div>

              <div className="relative mt-16 w-full max-w-3xl">
                <div className="animate-float-slow relative z-20 mx-auto grid h-72 w-72 place-items-center rounded-full bg-gradient-to-br from-sage-300 via-mint-100 to-blush-300 p-5 shadow-2xl shadow-green-950/20 md:h-96 md:w-96">
                  <div className="grid h-full w-full place-items-center rounded-full border border-white/80 bg-white/70 p-8 text-center backdrop-blur">
                    <div>
                      <div className="voice-emitter animate-breathe mx-auto grid h-20 w-20 place-items-center rounded-full bg-brand-600 text-3xl font-black text-white shadow-xl shadow-green-900/25">
                        <span className="voice-wave voice-wave-one" />
                        <span className="voice-wave voice-wave-two" />
                        <span className="voice-wave voice-wave-three" />
                        <span className="relative z-10 grid h-8 w-8 place-items-center rounded-full border-4 border-white/90">
                          <span className="h-3 w-3 rounded-full bg-white" />
                        </span>
                      </div>
                      <h1 className="mt-6 text-4xl font-black tracking-tight text-ink md:text-6xl">
                        Speak. Learn. Practice.
                      </h1>
                      <p className="mx-auto mt-4 max-w-sm text-sm font-semibold leading-7 text-slate-700">
                        A programming tutor that hears the question, remembers the lesson, and
                        builds the next study step.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pointer-events-none absolute -left-4 top-24 z-30 max-w-52 rounded-3xl border border-white/70 bg-white/60 p-4 shadow-lg shadow-green-950/5 backdrop-blur-md md:-left-12">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-brand-700">Student says</p>
                  <p className="mt-2 text-sm font-bold text-ink/80">Why does my API return 401?</p>
                </div>

                <div className="pointer-events-none absolute -right-4 bottom-28 z-30 max-w-56 rounded-3xl border border-white/70 bg-white/60 p-4 shadow-lg shadow-green-950/5 backdrop-blur-md md:-right-12">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-blush-500">Tutor replies</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700/80">
                    Check your JWT header, then compare it with Lesson 2: REST authentication.
                  </p>
                </div>
              </div>

              <div className="absolute bottom-8 z-30 flex flex-wrap justify-center gap-3">
                <Link className="btn-primary" href="/login">
                  Enter Demo Room
                </Link>
                <Link className="btn-secondary bg-white/70" href="/assistant">
                  Test Voice Tutor
                </Link>
              </div>
            </section>

            <aside className="animate-slide-right flex flex-col gap-4">
              <div className="card p-6">
                <p className="section-kicker">Today&apos;s loop</p>
                <div className="mt-5 space-y-3">
                  {workflow.map((step, index) => (
                    <div key={step} className="flex items-center gap-3 rounded-3xl bg-mint-50 p-3">
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-sm font-black text-brand-700 shadow-sm">
                        {index + 1}
                      </span>
                      <span className="text-sm font-black text-ink">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] bg-blush-300 p-6 shadow-xl shadow-rose-950/10">
                <p className="text-xs font-black uppercase tracking-[0.28em] text-rose-800">Instructor view</p>
                <h2 className="mt-4 text-3xl font-black text-ink">Find the lesson that needs help.</h2>
                <p className="mt-3 text-sm font-semibold leading-7 text-rose-950/80">
                  Questions, quiz misses, and search patterns become a map of where the class is
                  stuck.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-12">
        <div className="grid gap-4 md:grid-cols-3">
          {studioCards.map((card) => (
            <div key={card.title} className={`rounded-[2rem] bg-gradient-to-br ${card.accent} p-1 shadow-xl shadow-green-950/5`}>
              <div className="h-full rounded-[1.85rem] bg-white/68 p-6 backdrop-blur">
                <p className="text-xs font-black uppercase tracking-[0.26em] text-brand-700">Module</p>
                <h2 className="mt-4 text-3xl font-black text-ink">{card.title}</h2>
                <p className="mt-4 text-sm font-semibold leading-7 text-slate-700">{card.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="grid gap-4 rounded-[2rem] border border-brand-100 bg-white/55 p-5 shadow-2xl shadow-green-950/5 backdrop-blur lg:grid-cols-[0.75fr_1.25fr]">
          <div className="rounded-[1.5rem] bg-ink p-6 text-white">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-mint-100">Build story</p>
            <h2 className="mt-4 text-3xl font-black">One workflow, many AI systems.</h2>
            <p className="mt-4 text-sm leading-7 text-mint-50">
              This portfolio app is designed to show voice AI, retrieval, dashboards, and analytics
              as one learning product instead of disconnected demos.
            </p>
          </div>
          <div className="grid content-center gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {stack.map((item, index) => (
              <div key={item} className="rounded-3xl bg-mint-50 p-4">
                <p className="text-xs font-black text-brand-700">0{index + 1}</p>
                <p className="mt-3 font-black text-ink">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
