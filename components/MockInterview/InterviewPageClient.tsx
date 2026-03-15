"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { MockInterview } from "./MockInterview";

function InterviewContent() {
  const searchParams = useSearchParams();
  const tourMode = searchParams.get("tour") === "1";

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="font-display text-2xl font-bold tracking-tight text-foreground mb-2">
        Practice interview
      </h1>
      <p className="text-muted mb-6">
        Answer behavioral questions with supportive AI. Get framework-based feedback and unlock a badge when you finish.
      </p>
      <MockInterview tourMode={tourMode} />
    </div>
  );
}

export function InterviewPageClient() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground mb-2">Practice interview</h1>
        <p className="text-muted mb-6">Loading…</p>
      </div>
    }>
      <InterviewContent />
    </Suspense>
  );
}
