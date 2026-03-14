"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getSessionNotes, type SessionNote } from "@/lib/memory";

function NoteCard({ note }: { note: SessionNote }) {
  const [expanded, setExpanded] = useState(false);
  const date = new Date(note.createdAt).toLocaleDateString(undefined, {
    dateStyle: "medium",
  });
  const preview = note.content.slice(0, 200) + (note.content.length > 200 ? "…" : "");
  return (
    <div className="rounded-xl border border-border bg-card p-4">
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
  const [notes, setNotes] = useState<SessionNote[]>([]);

  useEffect(() => {
    setNotes(getSessionNotes());
  }, []);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="text-2xl font-bold text-foreground mb-2">My progress</h1>
      <p className="text-muted mb-6">
        Auto-generated notes after each mock interview. Use them to review feedback and areas to improve.
      </p>
      {notes.length === 0 ? (
        <p className="text-muted">
          No session notes yet. Complete a mock interview to see your first note.
        </p>
      ) : (
        <div className="space-y-4">
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
