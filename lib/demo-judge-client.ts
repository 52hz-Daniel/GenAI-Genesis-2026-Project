"use client";

const COOKIE_NAME = "demo_judge";

export function isDemoJudgeMode(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.includes(`${COOKIE_NAME}=`);
}

export async function enableDemoJudgeMode(): Promise<boolean> {
  try {
    const res = await fetch("/api/demo/judge", { method: "POST" });
    return res.ok;
  } catch {
    return false;
  }
}

export async function disableDemoJudgeMode(): Promise<boolean> {
  try {
    const res = await fetch("/api/demo/judge", { method: "DELETE" });
    return res.ok;
  } catch {
    return false;
  }
}
