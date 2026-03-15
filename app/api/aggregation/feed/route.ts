import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOrCreateUserByEmail } from "@/lib/db-users";
import { getRankedOpportunitiesForUser } from "@/lib/aggregation";
import { getSql } from "@/lib/db";

/**
 * GET /api/aggregation/feed
 * Returns top 5 ranked opportunities for the session user.
 * Optional: ?record_view=opportunity_id to record a view action (for anti-doomscroll).
 * Optional: ?content_type=trend to return only trend items (for a dedicated Trends section).
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ opportunities: [] }, { status: 401 });
    }
    const userId = await getOrCreateUserByEmail(session.user.email);
    if (!userId) {
      return NextResponse.json({ opportunities: [] });
    }

    const recordView = req.nextUrl.searchParams.get("record_view");
    if (recordView) {
      const sql = getSql();
      if (sql) {
        const sqlWithQuery = sql as unknown as {
          query: (q: string, p: string[]) => Promise<unknown>;
        };
        try {
          await sqlWithQuery.query(
            `INSERT INTO user_opportunity_actions (user_id, opportunity_id, action) VALUES ($1, $2, 'view')`,
            [userId, recordView]
          );
        } catch {
          // ignore invalid opportunity_id or DB errors
        }
      }
    }

    const contentTypeParam = req.nextUrl.searchParams.get("content_type");
    const options =
      contentTypeParam === "trend" || contentTypeParam === "opportunity"
        ? { contentType: contentTypeParam as "trend" | "opportunity" }
        : undefined;
    const opportunities = await getRankedOpportunitiesForUser(userId, session.user.email, options);
    return NextResponse.json({ opportunities });
  } catch (e) {
    console.error("aggregation/feed", e);
    return NextResponse.json({ opportunities: [] });
  }
}
