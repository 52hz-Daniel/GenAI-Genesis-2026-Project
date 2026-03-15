"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BadgeCard } from "@/components/BadgeCard/BadgeCard";
import { BadgeExport } from "@/components/BadgeExport/BadgeExport";
import { hasInterviewBadgeUnlocked } from "@/lib/badges";

export default function BadgesPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setUnlocked(hasInterviewBadgeUnlocked());
  }, []);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="font-display text-2xl font-bold tracking-tight text-foreground mb-2">My badges</h1>
      <p className="text-muted mb-8">
        Your verifiable soft skill achievements. Share them on LinkedIn or copy the text.
      </p>

      {!mounted ? (
        <div className="rounded-xl border border-border bg-card h-48 animate-pulse" />
      ) : (
        <div className="space-y-6">
          <BadgeCard unlocked={unlocked} />
          {unlocked && (
            <div className="space-y-3">
              <h2 className="text-sm font-medium text-foreground">Export and share</h2>
              <BadgeExport />
            </div>
          )}
          {!unlocked && (
            <p className="text-sm text-muted">
              <Link href="/interview" className="text-accent hover:underline">
                Complete the mock interview
              </Link>{" "}
              to unlock your first badge.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
