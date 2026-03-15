import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { getEffectiveUser } from "@/lib/demo-judge";

export type ProgressSession = {
  id: string;
  created_at: string;
  session_type: string;
};

export type ProgressInsight = {
  competency_name: string;
  insight_type: string;
  score: number | null;
  evidence_quote: string | null;
  created_at: string;
};

export async function GET(request: NextRequest) {
  try {
    const effective = await getEffectiveUser(request);
    if (!effective?.email) {
      return NextResponse.json({ sessions: [], insights: [] });
    }
    const sql = getSql();
    if (!sql) {
      return NextResponse.json({ sessions: [], insights: [] });
    }
    const userRows = await sql`SELECT id FROM users WHERE email = ${effective.email}`;
    const userRow = Array.isArray(userRows) ? userRows[0] : userRows;
    const userId = (userRow as { id: string } | undefined)?.id;
    if (!userId) {
      return NextResponse.json({ sessions: [], insights: [] });
    }

    const sessionRows = await sql`SELECT id, created_at, session_type FROM session_logs WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT 20`;
    const sessionList = Array.isArray(sessionRows) ? sessionRows : [sessionRows];
    const sessions: ProgressSession[] = sessionList.map((r: Record<string, unknown>) => ({
      id: String(r.id),
      created_at: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
      session_type: String(r.session_type ?? ""),
    }));

    const sqlWithQuery = sql as { query: (q: string, p: string[]) => Promise<Record<string, unknown>[]> };
    const insightRows = await sqlWithQuery.query(
      `SELECT c.name AS competency_name, si.insight_type, si.score, si.evidence_quote, si.created_at
       FROM session_insights si
       LEFT JOIN competencies c ON c.id = si.competency_id
       WHERE si.user_id = $1
       ORDER BY si.created_at DESC
       LIMIT 50`,
      [userId]
    );
    const insightList = Array.isArray(insightRows) ? insightRows : [];
    const insights: ProgressInsight[] = insightList.map((r: Record<string, unknown>) => ({
      competency_name: String(r.competency_name ?? "General"),
      insight_type: String(r.insight_type ?? ""),
      score: r.score != null ? Number(r.score) : null,
      evidence_quote: r.evidence_quote != null ? String(r.evidence_quote) : null,
      created_at: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
    }));

    return NextResponse.json({ sessions, insights });
  } catch {
    return NextResponse.json({ sessions: [], insights: [] });
  }
}
