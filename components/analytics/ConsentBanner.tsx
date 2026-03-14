"use client";

import { useState, useEffect } from "react";
import { getAnalyticsConsent, setAnalyticsConsent } from "@/lib/analytics-consent";

export function ConsentBanner() {
  const [status, setStatus] = useState<"pending" | "accepted" | "declined">("pending");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setStatus(getAnalyticsConsent());
  }, []);

  const accept = () => {
    setAnalyticsConsent("accepted");
    setStatus("accepted");
  };

  const decline = () => {
    setAnalyticsConsent("declined");
    setStatus("declined");
  };

  if (!mounted || status !== "pending") return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card p-4 shadow-lg"
      role="dialog"
      aria-label="Analytics consent"
    >
      <div className="mx-auto max-w-2xl">
        <p className="text-sm text-foreground mb-3">
          We use analytics to improve the product (e.g. time to first result, completion rates). No selling of data. You can opt out anytime.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={accept}
            className="rounded-lg bg-accent text-white px-4 py-2 text-sm font-medium hover:bg-accent/90"
          >
            Accept
          </button>
          <button
            type="button"
            onClick={decline}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted-bg"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
