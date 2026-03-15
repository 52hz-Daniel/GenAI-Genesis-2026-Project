"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { PostHogIdentify } from "./PostHogIdentify";

const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

function PostHogPageView() {
  const pathname = usePathname();
  const initial = useRef(true);

  useEffect(() => {
    if (initial.current) {
      initial.current = false;
      return;
    }
    if (typeof posthog.capture === "function") posthog.capture("$pageview");
  }, [pathname]);

  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!key || !host) return;
    posthog.init(key, {
      api_host: host,
      capture_pageview: false,
    });
    const t = setTimeout(() => {
      posthog.capture("$pageview");
    }, 0);
    return () => clearTimeout(t);
  }, []);

  return (
    <PHProvider client={posthog}>
      <PostHogPageView />
      <PostHogIdentify />
      {children}
    </PHProvider>
  );
}
