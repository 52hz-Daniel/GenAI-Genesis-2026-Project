import Link from "next/link";
import { OpportunitiesStrip } from "@/components/opportunities/OpportunitiesStrip";
import { JudgeDemoButtons } from "@/components/demo/JudgeDemoButtons";

export default function Home() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      {/* Hero */}
      <section className="text-center mb-12 sm:mb-16 animate-in">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl mb-4">
          Resume bullets + interview practice that remember you
        </h1>
        <p className="text-lg text-muted max-w-2xl mx-auto">
          Your first win is under 60 seconds away.
        </p>
        <section className="mt-6 rounded-xl border border-border bg-card/50 px-5 py-4 max-w-md mx-auto" aria-label="For judges">
          <p className="text-sm font-medium text-foreground mb-3">For judges</p>
          <p className="text-xs text-muted mb-3">Try the full product without signing in, or take a 3‑minute guided tour.</p>
          <JudgeDemoButtons />
        </section>
      </section>

      {/* Live Interview — first module */}
      <section className="mb-10 animate-in" style={{ animationDelay: "50ms" }}>
        <Link
          href="/live-interview?demo=1"
          className="group block rounded-xl border border-border bg-card p-6 sm:p-8 shadow hover:shadow-md hover:border-accent/40 transition-all duration-200"
        >
          <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-accent-soft text-accent">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </span>
          <h2 className="font-display text-xl font-semibold text-foreground mb-2 group-hover:text-accent transition-colors">
            Try a live interview with us
          </h2>
          <p className="text-muted mb-4">
            A short voice interview with the AI. No prep needed. Sign in when you’re ready to start.
          </p>
          <span className="inline-flex items-center gap-2 text-accent font-medium text-sm">
            Start 5‑minute demo
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </Link>
      </section>

      {/* Learning */}
      <section className="mb-10 animate-in" style={{ animationDelay: "100ms" }}>
        <Link
          href="/interview"
          className="group flex flex-col rounded-xl border border-border bg-card p-6 sm:p-8 shadow hover:shadow-md hover:border-accent/40 transition-all duration-200"
        >
          <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-accent-soft text-accent">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </span>
          <h2 className="font-display text-lg font-semibold text-foreground mb-2 group-hover:text-accent transition-colors">
            Learning
          </h2>
          <p className="text-muted flex-1">
            Practice behavioral questions with AI and get framework-based feedback.
          </p>
          <span className="mt-4 text-accent font-medium text-sm flex items-center gap-1">
            Start practice
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </Link>
      </section>

      {/* Community */}
      <section className="mb-10 animate-in" style={{ animationDelay: "150ms" }}>
        <OpportunitiesStrip />
      </section>

      {/* Translate */}
      <section className="mb-10 animate-in" style={{ animationDelay: "200ms" }}>
        <Link
          href="/translate"
          className="group flex flex-col rounded-xl border border-border bg-card p-6 sm:p-8 shadow hover:shadow-md hover:border-accent/40 transition-all duration-200"
        >
          <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-accent-soft text-accent">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </span>
          <h2 className="font-display text-lg font-semibold text-foreground mb-2 group-hover:text-accent transition-colors">
            Translate
          </h2>
          <p className="text-muted flex-1">
            Turn experiences into ATS-friendly resume bullets in seconds.
          </p>
          <span className="mt-4 text-accent font-medium text-sm flex items-center gap-1">
            Get started
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </Link>
      </section>

      {/* Create profile */}
      <section className="text-center animate-in" style={{ animationDelay: "250ms" }}>
        <p className="text-muted mb-4">
          Create your profile to save progress and get personalized opportunities.
        </p>
        <Link
          href="/auth/signin"
          className="inline-flex rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
        >
          Sign in
        </Link>
      </section>
    </div>
  );
}
