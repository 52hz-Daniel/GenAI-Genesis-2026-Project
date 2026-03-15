"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import type { OpportunityFeedItem, OpportunityContentType } from "@/lib/aggregation/types";
import type { ConfidenceDossier } from "@/lib/aggregation/types";
import { isDemoJudgeMode } from "@/lib/demo-judge-client";

function formatDeadline(opensAt: string | null, closesAt: string | null): string | null {
  if (closesAt) {
    const d = new Date(closesAt);
    if (!isNaN(d.getTime())) {
      const now = new Date();
      const days = Math.ceil((d.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
      if (days < 0) return "Closed";
      if (days === 0) return "Closes today";
      if (days === 1) return "Closes tomorrow";
      return `Closes in ${days} days`;
    }
  }
  if (opensAt) {
    const d = new Date(opensAt);
    if (!isNaN(d.getTime())) {
      const now = new Date();
      if (d.getTime() > now.getTime()) return `Opens ${d.toLocaleDateString()}`;
    }
  }
  return null;
}

export default function OpportunitiesPage() {
  const { data: session, status } = useSession();
  const [demoJudgeActive, setDemoJudgeActive] = useState(false);
  const [contentType, setContentType] = useState<OpportunityContentType | "all">("all");
  const [opportunities, setOpportunities] = useState<OpportunityFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dossier, setDossier] = useState<ConfidenceDossier | null>(null);
  const [dossierLoading, setDossierLoading] = useState(false);

  useEffect(() => {
    setDemoJudgeActive(isDemoJudgeMode());
  }, []);

  const canFetchFeed = (status === "authenticated" && session?.user) || demoJudgeActive;

  useEffect(() => {
    if (!canFetchFeed) {
      setLoading(false);
      return;
    }
    const url = contentType === "all" ? "/api/aggregation/feed" : `/api/aggregation/feed?content_type=${contentType}`;
    const load = () =>
      fetch(url, { credentials: "include" })
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data.opportunities)) setOpportunities(data.opportunities);
        })
        .catch(() => {})
        .finally(() => setLoading(false));

    if (demoJudgeActive) {
      fetch("/api/demo/seed-feed", { method: "POST", credentials: "include" })
        .then(() => load())
        .catch(() => load());
    } else {
      load();
    }
  }, [canFetchFeed, status, session?.user, contentType, demoJudgeActive]);

  const openDossier = (id: string) => {
    setSelectedId(id);
    setDossier(null);
    setDossierLoading(true);
    fetch(`/api/aggregation/feed?record_view=${id}`)
      .then(() => {})
      .catch(() => {});
    fetch(`/api/aggregation/dossier?opportunity_id=${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.competencyBridge != null) setDossier(data as ConfidenceDossier);
      })
      .catch(() => {})
      .finally(() => setDossierLoading(false));
  };

  const closeDossier = () => {
    setSelectedId(null);
    setDossier(null);
  };

  const recordAction = (opportunityId: string, action: "apply" | "save" | "reject") => {
    fetch("/api/aggregation/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ opportunity_id: opportunityId, action }),
    })
      .then(() => {})
      .catch(() => {});
    closeDossier();
  };

  if (status === "loading" || loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground mb-2">Community</h1>
        <div className="rounded-xl border border-border bg-card h-48 animate-pulse" />
      </div>
    );
  }

  if (!session?.user && !demoJudgeActive) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground mb-2">Community</h1>
        <p className="text-muted mb-6">
          Sign in to see opportunities matched to your profile and progress.
        </p>
        <button
          type="button"
          onClick={() => signIn(undefined, { callbackUrl: "/opportunities" })}
          className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
        >
          Sign in
        </button>
      </div>
    );
  }

  const selected = selectedId ? opportunities.find((o) => o.id === selectedId) : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="font-display text-2xl font-bold tracking-tight text-foreground mb-2">Community</h1>
      <p className="text-muted mb-6">
        Curated for you based on your profile and practice. See why you’re ready and take action.
      </p>

      <div className="flex gap-2 mb-6">
        {(["all", "opportunity", "trend"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setContentType(tab)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              contentType === tab
                ? "bg-accent text-white"
                : "border border-border text-muted hover:bg-muted-bg hover:text-foreground"
            }`}
          >
            {tab === "all" ? "All" : tab === "trend" ? "Trends" : "Opportunities"}
          </button>
        ))}
      </div>

      {opportunities.length === 0 ? (
        <div className="text-muted rounded-xl border border-border bg-card p-6">
          <p className="mb-1">No opportunities right now.</p>
          <p className="text-sm">
            Complete a mock interview to improve matching, or run the aggregation pipeline (see docs) to seed sample opportunities.
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {opportunities.map((opp) => {
            const deadline = formatDeadline(opp.opens_at ?? null, opp.closes_at ?? null);
            return (
              <li key={opp.id}>
                <div className="rounded-xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-semibold text-foreground">{opp.title}</h2>
                        {opp.content_type === "trend" && (
                          <span className="rounded bg-accent/15 px-1.5 py-0.5 text-xs font-medium text-accent">Trend</span>
                        )}
                        {deadline && (
                          <span className="rounded bg-muted-bg px-1.5 py-0.5 text-xs text-muted">{deadline}</span>
                        )}
                      </div>
                      {opp.source && (
                        <span className="text-xs text-muted">{opp.source}</span>
                      )}
                      {opp.description && (
                        <p className="text-sm text-muted mt-1 line-clamp-2">{opp.description}</p>
                      )}
                      {opp.required_competencies?.length > 0 && (
                        <p className="text-xs text-muted mt-1">
                          {opp.required_competencies.slice(0, 3).join(", ")}
                        </p>
                      )}
                    </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => openDossier(opp.id)}
                      className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted-bg transition-colors"
                    >
                      See why you’re ready
                    </button>
                    {opp.url && (
                      <a
                        href={opp.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-hover transition-colors text-center"
                      >
                        View
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </li>
            );
          })}
        </ul>
      )}

      {/* Dossier modal */}
      {selectedId && selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-label="Confidence dossier"
        >
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">{selected.title}</h3>
              <button
                type="button"
                onClick={closeDossier}
                className="rounded p-1 text-muted hover:bg-muted-bg hover:text-foreground"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {dossierLoading ? (
              <div className="h-32 animate-pulse rounded bg-muted-bg" />
            ) : dossier ? (
              <>
                <p className="text-sm text-muted mb-1 font-medium">Why you’re ready</p>
                <p className="text-sm text-foreground mb-4">{dossier.competencyBridge}</p>
                <p className="text-sm text-muted mb-1 font-medium">Watch out for</p>
                <p className="text-sm text-foreground mb-4">{dossier.blindSpotWarning}</p>
                <p className="text-sm text-muted mb-1 font-medium">Reflection</p>
                <p className="text-sm text-foreground mb-6">{dossier.socraticPrompt}</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => recordAction(selectedId, "apply")}
                    className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
                  >
                    I’ll apply
                  </button>
                  <button
                    type="button"
                    onClick={() => recordAction(selectedId, "save")}
                    className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted-bg"
                  >
                    Save for later
                  </button>
                  <button
                    type="button"
                    onClick={() => recordAction(selectedId, "reject")}
                    className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted hover:bg-muted-bg"
                  >
                    Not for me
                  </button>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted">Could not load dossier.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
