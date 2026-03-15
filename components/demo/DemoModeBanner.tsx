"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { isDemoJudgeMode, disableDemoJudgeMode } from "@/lib/demo-judge-client";

export function DemoModeBanner() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(isDemoJudgeMode());
  }, []);

  if (!active) return null;

  const handleExit = async () => {
    const ok = await disableDemoJudgeMode();
    if (ok) {
      setActive(false);
      window.location.reload();
    }
  };

  return (
    <div className="bg-accent/10 border-b border-accent/20 px-4 py-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm">
      <span className="text-foreground font-medium">Demo mode – full access</span>
      <Link href="/?tour=1" className="text-accent hover:underline font-medium">
        Start 3‑min tour
      </Link>
      <button type="button" onClick={handleExit} className="text-accent hover:underline font-medium">
        Exit demo
      </button>
    </div>
  );
}
