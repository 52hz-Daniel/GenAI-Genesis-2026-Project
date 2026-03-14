"use client";

import { INTERVIEW_BADGE_TITLE, INTERVIEW_BADGE_DESCRIPTION } from "@/lib/badges";

export function BadgeCard({ unlocked }: { unlocked: boolean }) {
  return (
    <div
      className={`rounded-xl border-2 p-6 text-center transition-all ${
        unlocked
          ? "border-accent bg-accent-soft/30"
          : "border-border bg-muted-bg/50 opacity-60"
      }`}
    >
      <div
        className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full ${
          unlocked ? "bg-accent/20 text-accent" : "bg-muted-bg text-muted"
        }`}
      >
        <svg
          className="h-10 w-10"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
          />
        </svg>
      </div>
      <h3 className="font-semibold text-foreground">{INTERVIEW_BADGE_TITLE}</h3>
      <p className="mt-1 text-sm text-muted">{INTERVIEW_BADGE_DESCRIPTION}</p>
      {!unlocked && (
        <p className="mt-3 text-xs text-muted">
          Complete the mock interview to unlock this badge.
        </p>
      )}
    </div>
  );
}
