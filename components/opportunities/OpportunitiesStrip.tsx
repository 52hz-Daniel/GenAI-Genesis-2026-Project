"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import type { OpportunityFeedItem } from "@/lib/aggregation/types";
import { isDemoJudgeMode } from "@/lib/demo-judge-client";

export function OpportunitiesStrip() {
  const { data: session, status } = useSession();
  const [demoJudgeActive, setDemoJudgeActive] = useState(false);
  const [opportunities, setOpportunities] = useState<OpportunityFeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setDemoJudgeActive(isDemoJudgeMode());
  }, []);

  const canFetch = (status === "authenticated" && session?.user) || demoJudgeActive;

  useEffect(() => {
    if (!canFetch) {
      setLoading(false);
      return;
    }
    fetch("/api/aggregation/feed")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.opportunities)) setOpportunities(data.opportunities.slice(0, 2));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [canFetch, status, session?.user, demoJudgeActive]);

  if (status === "loading" || loading) return null;

  if (!session?.user && !demoJudgeActive) {
    return (
      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="font-display text-lg font-semibold text-foreground mb-2">Community</h2>
        <p className="text-muted mb-4">
          Opportunities and trends matched to your profile. Sign in to see your feed.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => signIn(undefined, { callbackUrl: "/" })}
            className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
          >
            Sign in
          </button>
          <Link
            href="/opportunities"
            className="text-sm font-medium text-accent hover:underline"
          >
            Go to Community
          </Link>
        </div>
      </section>
    );
  }

  if (opportunities.length === 0) return null;

  return (
    <section>
      <h2 className="font-display text-lg font-semibold text-foreground mb-3">Community</h2>
      <p className="text-muted mb-3 text-sm">Opportunities and trends matched to your profile.</p>
      <div className="space-y-3">
        {opportunities.map((opp) => (
          <Link
            key={opp.id}
            href="/opportunities"
            className="block rounded-xl border border-border bg-card p-4 shadow-sm hover:shadow-md hover:border-accent/30 transition-all"
          >
            <h3 className="font-medium text-foreground">{opp.title}</h3>
            {opp.source && <span className="text-xs text-muted">{opp.source}</span>}
            {opp.description && (
              <p className="text-sm text-muted mt-1 line-clamp-2">{opp.description}</p>
            )}
          </Link>
        ))}
      </div>
      <Link
        href="/opportunities"
        className="mt-3 inline-block text-sm font-medium text-accent hover:underline"
      >
        Go to Community
      </Link>
    </section>
  );
}
