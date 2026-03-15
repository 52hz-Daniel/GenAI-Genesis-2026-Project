"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { DEMO_TOUR_STEPS, DEMO_TOUR_STEP_INDEX_INTERVIEW_RUN } from "./demo-tour-steps";
import { enableDemoJudgeMode } from "@/lib/demo-judge-client";

const TOUR_PARAM = "tour";

export function DemoTourOverlay() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const tourActive = searchParams.get(TOUR_PARAM) === "1";
  const [stepIndex, setStepIndex] = useState(0);
  const [step4Complete, setStep4Complete] = useState(false);
  const [judgeModeEnabled, setJudgeModeEnabled] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!tourActive) return;
    if (!judgeModeEnabled) {
      enableDemoJudgeMode().then(() => setJudgeModeEnabled(true));
    }
  }, [tourActive, judgeModeEnabled]);

  useEffect(() => {
    if (!tourActive) return;
    const handler = () => setStep4Complete(true);
    window.addEventListener("demo-tour-interview-done", handler);
    return () => window.removeEventListener("demo-tour-interview-done", handler);
  }, [tourActive]);

  const goNext = useCallback(() => {
    if (stepIndex >= DEMO_TOUR_STEPS.length - 1) {
      router.push("/");
      return;
    }
    const next = stepIndex + 1;
    setStepIndex(next);
    if (next === DEMO_TOUR_STEP_INDEX_INTERVIEW_RUN + 1) setStep4Complete(false);
    const step = DEMO_TOUR_STEPS[next];
    if (step?.url) router.push(step.url + "?tour=1");
  }, [stepIndex, router]);

  const goBack = useCallback(() => {
    if (stepIndex <= 0) return;
    const prev = stepIndex - 1;
    setStepIndex(prev);
    const step = DEMO_TOUR_STEPS[prev];
    if (step?.url) router.push(step.url + "?tour=1"); else router.push("/?tour=1");
  }, [stepIndex, router]);

  const exitTour = useCallback(() => {
    router.push(pathname?.replace(/\?.*$/, "") || "/");
  }, [router, pathname]);

  if (!tourActive) return null;

  const step = DEMO_TOUR_STEPS[stepIndex];
  if (!step) return null;

  const isStep4 = stepIndex === DEMO_TOUR_STEP_INDEX_INTERVIEW_RUN;
  const canNext = !isStep4 || step4Complete;

  const stepLabel = `Step ${stepIndex + 1} of ${DEMO_TOUR_STEPS.length}`;

  if (collapsed) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur shadow-lg">
        <div className="mx-auto max-w-2xl px-4 py-2 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-foreground hover:bg-muted-bg rounded-lg"
            aria-label="Expand tour instructions"
          >
            <svg className="w-4 h-4 rotate-[-90deg]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            {stepLabel}
          </button>
          <button type="button" onClick={exitTour} className="text-xs text-muted hover:text-foreground px-2 py-1">
            Exit tour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur shadow-lg">
      <div className="mx-auto max-w-2xl px-4 py-4">
        <p className="text-xs text-muted mb-1">{stepLabel}</p>
        <h3 className="font-semibold text-foreground mb-1">{step.title}</h3>
        <p className="text-sm text-muted mb-4">{step.body}</p>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            className="rounded p-1.5 text-muted hover:bg-muted-bg hover:text-foreground"
            aria-label="Collapse to see the page"
            title="Collapse"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <button type="button" onClick={exitTour} className="text-sm text-muted hover:text-foreground">
            Exit tour
          </button>
          <button
            type="button"
            onClick={goBack}
            disabled={stepIndex === 0}
            className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-muted-bg disabled:opacity-50"
          >
            Back
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={!canNext}
            className="rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
          >
            {stepIndex >= DEMO_TOUR_STEPS.length - 1 ? "Finish" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
