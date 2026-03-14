import { NextRequest, NextResponse } from "next/server";

type SingleEvent = { name: string; timestamp?: number; [k: string]: unknown };
type BatchBody = { events?: SingleEvent[] } | SingleEvent;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as BatchBody;
    const events = Array.isArray(body.events) ? body.events : [body];
    if (process.env.NODE_ENV === "development") {
      console.log("[Aptitude Events]", events.length, events);
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
