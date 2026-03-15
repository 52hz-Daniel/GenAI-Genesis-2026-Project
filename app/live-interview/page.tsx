/**
 * Sector 4: Live 30‑minute voice interview.
 * Owner: Agent 4. Do not edit from Agent 1, 2, 3.
 */
import Link from "next/link";
import { LiveInterview } from "@/components/LiveInterview/LiveInterview";

export const metadata = {
  title: "Live interview | Aptitude AI",
  description: "Real-time 30-minute voice interview with your AI interviewer.",
};

export default function LiveInterviewPage({
  searchParams,
}: {
  searchParams: { demo?: string };
}) {
  const demoMode = searchParams?.demo === "1";
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="font-display text-2xl font-bold tracking-tight text-foreground mb-2">
        {demoMode ? "5-minute demo" : "Live voice interview"}
      </h1>
      <p className="text-muted mb-4">
        {demoMode
          ? "Short voice interview with the AI. Real-time, low-latency responses."
          : "Real-time 30-minute behavioral interview. Speak with the AI interviewer and get low-latency voice responses."}
      </p>

      <section className="mb-6 rounded-xl border border-border bg-card p-4 text-sm" aria-label="Why this feels different">
        <h2 className="font-semibold text-foreground mb-2">Why this feels different</h2>
        <p className="text-muted mb-3">
          Real-time voice with low latency. Your context (profile and practice history) is used to personalize the conversation.
        </p>
        <ul className="list-disc list-inside space-y-1 text-muted mb-3">
          <li>Your interviewer uses your name and practice history</li>
          <li>Opens with context-aware rapport (e.g. &quot;Good to see you again so soon&quot; when you&apos;ve just practiced)</li>
          <li>Professional small talk and a comfortable, human-like environment</li>
        </ul>
        <p className="text-muted">
          The capstone of our learn-then-test flow: practice with feedback first, then prove it in a 30-minute live run.
        </p>
        <details className="mt-3">
          <summary className="cursor-pointer text-accent font-medium hover:underline">For judges and investors</summary>
          <p className="mt-2 text-muted text-xs">
            We combine real-time voice with memory so the AI acts like a real interviewer who knows you. Feasible (tech), desirable (user experience), and viable (learn then test).
          </p>
        </details>
      </section>

      <LiveInterview demoMode={demoMode} />
      <p className="mt-6 text-sm text-muted">
        <Link href="/interview" className="text-accent font-medium hover:underline">
          ← Back to Learning
        </Link>
      </p>
    </div>
  );
}
