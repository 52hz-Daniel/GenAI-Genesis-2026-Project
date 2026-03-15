import { NextResponse } from "next/server";

const COOKIE_NAME = "demo_judge";
const MAX_AGE = 60 * 60 * 24; // 24 hours

/**
 * POST /api/demo/judge
 * Sets the demo_judge cookie so unauthenticated judges get full access (effective user = DEMO_JUDGE_EMAIL).
 * Used for hackathon demos.
 */
export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, "1", {
    path: "/",
    maxAge: MAX_AGE,
    sameSite: "lax",
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}

/**
 * DELETE /api/demo/judge
 * Clears the demo_judge cookie.
 */
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
  return res;
}
