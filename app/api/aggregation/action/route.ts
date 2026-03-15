import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOrCreateUserByEmail } from "@/lib/db-users";
import { getSql } from "@/lib/db";

const VALID_ACTIONS = ["apply", "save", "reject"] as const;

/**
 * POST /api/aggregation/action
 * Body: { opportunity_id: string, action: "apply" | "save" | "reject" }
 * Records the user action for ranking and analytics.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = await getOrCreateUserByEmail(session.user.email);
    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const body = await req.json().catch(() => ({}));
    const opportunityId = body?.opportunity_id;
    const action = body?.action;
    if (!opportunityId || typeof opportunityId !== "string") {
      return NextResponse.json({ error: "Missing opportunity_id" }, { status: 400 });
    }
    if (!VALID_ACTIONS.includes(action)) {
      return NextResponse.json({ error: "Invalid action; use apply, save, or reject" }, { status: 400 });
    }
    const sql = getSql();
    if (!sql) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }
    const sqlWithQuery = sql as unknown as {
      query: (q: string, p: string[]) => Promise<unknown>;
    };
    await sqlWithQuery.query(
      `INSERT INTO user_opportunity_actions (user_id, opportunity_id, action) VALUES ($1, $2, $3)`,
      [userId, opportunityId, action]
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("aggregation/action", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
