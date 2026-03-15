"use client";

import { useState, useEffect } from "react";
import { getAnalyticsConsent, ANALYTICS_CONSENT_CHANGED } from "@/lib/analytics-consent";
import { PostHogProvider } from "@/components/analytics/PostHogProvider";
import { GoogleAnalytics } from "@next/third-parties/google";

const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export function AnalyticsGate({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<"pending" | "accepted" | "declined">("pending");

  useEffect(() => {
    setConsent(getAnalyticsConsent());
    const onConsentChange = () => setConsent(getAnalyticsConsent());
    window.addEventListener(ANALYTICS_CONSENT_CHANGED, onConsentChange);
    return () => window.removeEventListener(ANALYTICS_CONSENT_CHANGED, onConsentChange);
  }, []);

  const accepted = consent === "accepted";

  if (accepted) {
    return (
      <PostHogProvider>
        {children}
        {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
      </PostHogProvider>
    );
  }

  return <>{children}</>;
}
