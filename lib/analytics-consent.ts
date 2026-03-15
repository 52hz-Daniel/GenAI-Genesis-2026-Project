const CONSENT_KEY = "aptitude_analytics_consent";

export type ConsentStatus = "pending" | "accepted" | "declined";

export function getAnalyticsConsent(): ConsentStatus {
  if (typeof window === "undefined") return "pending";
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    if (v === "accepted" || v === "declined") return v;
  } catch {
    // ignore
  }
  return "pending";
}

export const ANALYTICS_CONSENT_CHANGED = "aptitude_analytics_consent_changed";

export function setAnalyticsConsent(status: "accepted" | "declined"): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CONSENT_KEY, status);
    window.dispatchEvent(new CustomEvent(ANALYTICS_CONSENT_CHANGED, { detail: status }));
  } catch {
    // ignore
  }
}
