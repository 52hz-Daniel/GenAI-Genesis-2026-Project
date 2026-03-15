"use client";

import { useState, useEffect } from "react";

const DEFAULT_TOTAL_SECONDS = 30 * 60;

type LiveInterviewTimerProps = {
  running: boolean;
  onExpire?: () => void;
  className?: string;
  totalSeconds?: number;
};

export function LiveInterviewTimer({ running, onExpire, className = "", totalSeconds = DEFAULT_TOTAL_SECONDS }: LiveInterviewTimerProps) {
  const [secondsRemaining, setSecondsRemaining] = useState(totalSeconds);

  useEffect(() => {
    if (!running) return;
    if (secondsRemaining <= 0) {
      onExpire?.();
      return;
    }
    const t = setInterval(() => {
      setSecondsRemaining((s) => {
        if (s <= 1) {
          clearInterval(t);
          onExpire?.();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running, secondsRemaining, onExpire]);

  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const display = `${mins}:${secs.toString().padStart(2, "0")}`;

  return (
    <div className={className} data-testid="live-interview-timer">
      <span className="font-mono text-lg font-medium tabular-nums text-foreground">{display}</span>
      <span className="ml-2 text-sm text-muted-foreground">remaining</span>
    </div>
  );
}

export { DEFAULT_TOTAL_SECONDS as LIVE_INTERVIEW_DURATION_SECONDS };
