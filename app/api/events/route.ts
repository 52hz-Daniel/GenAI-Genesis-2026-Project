import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserByEmail } from "@/lib/db-users";
import { getSql } from "@/lib/db";

type SingleEvent = { name: string; timestamp?: number; [k: string]: unknown };
type BatchBody = { events?: SingleEvent[] } | SingleEvent;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as BatchBody;
    const events = Array.isArray(body.events) ? body.events : [body];
    if (process.env.NODE_ENV === "development") {
      console.log("[Aptitude Events]", events.length, events);
    }

    const sql = getSql();
    if (sql) {
      let userId: string | null = null;
      const session = await getServerSession(authOptions);
      if (session?.user?.email) {
        const user = await getUserByEmail(session.user.email);
        userId = user?.id ?? null;
      }

      for (const ev of events) {
        const name = typeof ev.name === "string" ? ev.name : "unknown";
        const timestamp = typeof ev.timestamp === "number" ? ev.timestamp : null;
        const rest = { ...ev };
        delete rest.name;
        delete rest.timestamp;
        const propsJson = Object.keys(rest).length > 0 ? (rest as Record<string, unknown>) : null;

        await sql`
          INSERT INTO analytics_events (name, props, timestamp, user_id)
          VALUES (${name}, ${propsJson}, ${timestamp}, ${userId})
        `;
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    if (process.env.NODE_ENV === "development") console.error("[Aptitude Events]", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
