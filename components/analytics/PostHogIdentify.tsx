"use client";

import { useSession } from "next-auth/react";
import posthog from "posthog-js";
import { useEffect } from "react";

export function PostHogIdentify() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.email) return;
    posthog.identify(session.user.email);
  }, [status, session?.user?.email]);

  return null;
}
