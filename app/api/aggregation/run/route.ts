import { NextRequest, NextResponse } from "next/server";
import { runAllScouts } from "@/lib/integrations";
import { runBrain } from "@/lib/integrations";

/**
 * POST /api/aggregation/run
 * Runs scouts (staging) then Brain (process staging -> opportunities).
 * Protected: require ?secret=CRON_SECRET, header x-cron-secret, or Authorization: Bearer CRON_SECRET (Vercel Cron).
 * Configure CRON_SECRET in env and call from Temporal, Vercel Cron, or external scheduler.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const provided =
    req.nextUrl.searchParams.get("secret") ??
    req.headers.get("x-cron-secret") ??
    bearerToken;
  if (!secret || provided !== secret) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const scouts = await runAllScouts();
    const brain = await runBrain(20);
    return NextResponse.json({
      scouts: { stub: scouts.stub, url: scouts.url, rss: scouts.rss },
      brain: { processed: brain.processed, skipped: brain.skipped },
    });
  } catch (e) {
    console.error("aggregation/run", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
