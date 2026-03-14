import type { EventName, EventProps } from "./analytics";
import { getAnalyticsConsent } from "./analytics-consent";

const BATCH_INTERVAL_MS = 5000;
const BATCH_MAX_SIZE = 10;
const QUEUE_KEY = "aptitude_analytics_queue";

type QueuedEvent = { name: EventName; props?: EventProps; timestamp: number };

function getQueue(): QueuedEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(QUEUE_KEY);
    if (raw) return JSON.parse(raw) as QueuedEvent[];
  } catch {
    // ignore
  }
  return [];
}

function setQueue(queue: QueuedEvent[]): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch {
    // ignore
  }
}

function flush(): void {
  const queue = getQueue();
  if (queue.length === 0) return;
  if (getAnalyticsConsent() !== "accepted") {
    setQueue([]);
    return;
  }
  setQueue([]);
  const payload = { events: queue };
  const body = JSON.stringify(payload);
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/events", new Blob([body], { type: "application/json" }));
    } else {
      fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // restore queue on failure so we can retry
    setQueue(queue);
  }
}

function scheduleFlush(): void {
  if (typeof window === "undefined") return;
  const queue = getQueue();
  if (queue.length >= BATCH_MAX_SIZE) {
    flush();
    return;
  }
  if (typeof requestIdleCallback !== "undefined") {
    requestIdleCallback(() => flush(), { timeout: BATCH_INTERVAL_MS });
  } else {
    setTimeout(flush, BATCH_INTERVAL_MS);
  }
}

export function logEventBatched(name: EventName, props?: EventProps): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("aptitude_analytics", { detail: { name, ...props, timestamp: Date.now() } }));
  if (process.env.NODE_ENV === "development") {
    console.log("[Aptitude Analytics]", name, props);
  }
  if (getAnalyticsConsent() !== "accepted") return;
  const queue = getQueue();
  queue.push({ name, props, timestamp: Date.now() });
  setQueue(queue);
  if (queue.length >= BATCH_MAX_SIZE) {
    flush();
  } else {
    scheduleFlush();
  }
}

export function flushAnalytics(): void {
  flush();
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => flush());
  window.addEventListener("pagehide", () => flush());
}
