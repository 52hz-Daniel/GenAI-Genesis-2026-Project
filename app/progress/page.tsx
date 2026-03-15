"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { getSessionNotes, type SessionNote } from "@/lib/memory";
import { isDemoJudgeMode } from "@/lib/demo-judge-client";
import type { ProgressSession, ProgressInsight } from "@/app/api/progress/route";

function NoteCard({ note }: { note: SessionNote }) {
  const [expanded, setExpanded] = useState(false);
  const date = new Date(note.createdAt).toLocaleDateString(undefined, {
    dateStyle: "medium",
  });
  const preview = note.content.slice(0, 200) + (note.content.length > 200 ? "…" : "");
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm p-4">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-sm text-muted">{date}</span>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-sm font-medium text-accent hover:underline"
        >
          {expanded ? "Collapse" : "Expand"}
        </button>
      </div>
      {expanded ? (
        <div className="prose prose-sm dark:prose-invert max-w-none text-foreground whitespace-pre-wrap">
          {note.content}
        </div>
      ) : (
        <p className="text-sm text-muted whitespace-pre-wrap">{preview}</p>
      )}
    </div>
  );
}

export default function ProgressPage() {
  const { data: session } = useSession();
  const [demoJudgeActive, setDemoJudgeActive] = useState(false);
  const [notes, setNotes] = useState<SessionNote[]>([]);
  const [sessions, setSessions] = useState<ProgressSession[]>([]);
  const [insights, setInsights] = useState<ProgressInsight[]>([]);

  useEffect(() => {
    setNotes(getSessionNotes());
  }, []);

  useEffect(() => {
    setDemoJudgeActive(isDemoJudgeMode());
  }, []);

  const canFetchProgress = session?.user || demoJudgeActive;

  useEffect(() => {
    if (!canFetchProgress) return;
    fetch("/api/progress")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.sessions)) setSessions(data.sessions);
        if (Array.isArray(data.insights)) setInsights(data.insights);
      })
      .catch(() => {});
  }, [canFetchProgress, session?.user, demoJudgeActive]);

  const hasDbProgress = canFetchProgress && (sessions.length > 0 || insights.length > 0);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="font-display text-2xl font-bold tracking-tight text-foreground mb-2">My progress</h1>
      <p className="text-muted mb-6">
        Auto-generated notes after each mock interview. Review feedback and areas to improve.
      </p>
      {hasDbProgress && (
        <>
          {sessions.length > 0 && (
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-foreground mb-3">Sessions</h2>
              <ul className="space-y-2">
                {sessions.map((s) => (
                  <li key={s.id} className="text-sm text-muted">
                    {new Date(s.created_at).toLocaleDateString(undefined, { dateStyle: "medium" })} · {s.session_type}
                  </li>
                ))}
              </ul>
            </section>
          )}
          {insights.length > 0 && (
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-foreground mb-3">Insights</h2>
              <div className="space-y-3">
                {insights.slice(0, 20).map((i, idx) => (
                  <div key={idx} className="rounded-xl border border-border bg-card shadow-sm p-3">
                    <span className="text-xs font-medium text-accent">{i.competency_name}</span>
                    <span className="text-xs text-muted ml-2">({i.insight_type})</span>
                    {i.score != null && <span className="text-xs text-muted ml-2">Score: {i.score}</span>}
                    {i.evidence_quote && <p className="text-sm text-foreground mt-1">{i.evidence_quote}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
      {!hasDbProgress && notes.length === 0 && (
        <p className="text-muted">
          No session notes yet. Complete a mock interview to see your first note.
        </p>
      )}
      {!hasDbProgress && notes.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Session notes (this device)</h2>
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      )}
      <div className="mt-6">
        <Link
          href="/interview"
          className="text-accent font-medium hover:underline"
        >
          Practice another interview
        </Link>
      </div>
    </div>
  );
}
