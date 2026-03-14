import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <section className="text-center mb-16 sm:mb-20">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl mb-4">
          Your career companion, not another app
        </h1>
        <p className="text-lg text-muted max-w-2xl mx-auto">
          Turn what you did in class into resume ready bullets and practice interviews
          with supportive AI. No judgment, no waiting.
        </p>
      </section>

      <section className="grid gap-6 sm:grid-cols-2 sm:gap-8">
        <Link
          href="/translate"
          className="group flex flex-col rounded-xl border border-border bg-card p-6 sm:p-8 shadow-sm hover:shadow-md hover:border-accent/50 transition-all duration-200"
        >
          <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-accent-soft text-accent">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </span>
          <h2 className="text-xl font-semibold text-foreground mb-2 group-hover:text-accent transition-colors">
            Translate an experience
          </h2>
          <p className="text-muted flex-1">
            Paste what you did in class or at work and get three professional,
            ATS friendly resume bullet options in seconds.
          </p>
          <span className="mt-4 text-accent font-medium text-sm flex items-center gap-1">
            Get started
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </Link>

        <Link
          href="/interview"
          className="group flex flex-col rounded-xl border border-border bg-card p-6 sm:p-8 shadow-sm hover:shadow-md hover:border-accent/50 transition-all duration-200"
        >
          <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-accent-soft text-accent">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </span>
          <h2 className="text-xl font-semibold text-foreground mb-2 group-hover:text-accent transition-colors">
            Practice interview
          </h2>
          <p className="text-muted flex-1">
            Answer behavioral questions with a supportive AI. Get gentle feedback
            and unlock a digital badge when you finish.
          </p>
          <span className="mt-4 text-accent font-medium text-sm flex items-center gap-1">
            Start practice
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </Link>
      </section>

      <p className="text-center text-sm text-muted mt-12">
        No sign up needed. Your first win is under 60 seconds away.
      </p>
    </div>
  );
}
