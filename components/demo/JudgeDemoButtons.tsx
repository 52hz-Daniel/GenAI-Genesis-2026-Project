"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { enableDemoJudgeMode, isDemoJudgeMode } from "@/lib/demo-judge-client";

export function JudgeDemoButtons({ onStartTour }: { onStartTour?: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleJudgeMode = async () => {
    setLoading(true);
    const ok = await enableDemoJudgeMode();
    setLoading(false);
    if (ok) window.location.reload();
  };

  const handle3MinTour = async () => {
    setLoading(true);
    if (!isDemoJudgeMode()) await enableDemoJudgeMode();
    setLoading(false);
    if (onStartTour) {
      onStartTour();
      return;
    }
    router.push("/?tour=1");
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <button
        type="button"
        onClick={handleJudgeMode}
        disabled={loading}
        className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted-bg transition-colors disabled:opacity-50"
      >
        {loading ? "…" : "Experience as judge (no login)"}
      </button>
      <button
        type="button"
        onClick={handle3MinTour}
        disabled={loading}
        className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover transition-colors disabled:opacity-50"
      >
        {loading ? "…" : "Experience the platform in 3 mins"}
      </button>
    </div>
  );
}
