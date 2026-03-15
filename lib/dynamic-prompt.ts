import { getSql } from "./db";
import { getUserByEmail } from "./db-users";

export type DynamicContext = {
  daysSinceActive: number;
  targetWeakness: string | null;
  recentSpark: string | null;
};

/** Build dynamic coaching context for a user (by email). Returns null if no DB or no user. */
export async function getDynamicContextForUser(email: string): Promise<DynamicContext | null> {
  const sql = getSql();
  if (!sql) return null;
  const user = await getUserByEmail(email);
  if (!user) return null;

  const userId = user.id;

  const daysRows = await sql`SELECT EXTRACT(DAY FROM (NOW() - last_active_at))::int AS d FROM users WHERE id = ${userId}`;
  const daysRow = Array.isArray(daysRows) ? daysRows[0] : daysRows;
  const days = (daysRow as { d: number } | undefined)?.d ?? 0;

  const sqlWithQuery = sql as unknown as { query: (q: string, p: string[]) => Promise<Record<string, unknown>[]> };
  const weaknessRows = await sqlWithQuery.query(
    `SELECT c.name FROM competencies c
     INNER JOIN session_insights si ON si.competency_id = c.id
     WHERE si.user_id = $1 AND si.insight_type = 'weakness'
     GROUP BY c.name
     ORDER BY AVG(si.score) ASC, MAX(si.created_at) DESC
     LIMIT 1`,
    [userId]
  );
  const w = Array.isArray(weaknessRows) && weaknessRows[0] ? weaknessRows[0].name : undefined;
  const targetWeakness = w != null && String(w).trim() ? String(w).trim() : null;

  const sparkRows = await sql`SELECT evidence_quote FROM session_insights
    WHERE user_id = ${userId} AND (insight_type = 'hidden_spark' OR insight_type = 'strength')
    ORDER BY created_at DESC LIMIT 1`;
  const sparkRow = Array.isArray(sparkRows) ? sparkRows[0] : sparkRows;
  const recentSpark = (sparkRow as { evidence_quote: string } | undefined)?.evidence_quote ?? null;

  return { daysSinceActive: days, targetWeakness, recentSpark };
}

/** Format dynamic context as a string for system prompt injection. */
export function formatDynamicContext(ctx: DynamicContext): string {
  const parts: string[] = [];
  parts.push(
    "Evaluate this user against the Pyramid Principle, MECE, and STAR with quantifiable Result. " +
    "Use the candidate profile (in the context below) to emphasize the most relevant framework (e.g. consulting: structure and MECE; PM: impact and prioritization; general: all three, with STAR Result always)."
  );
  if (ctx.targetWeakness) {
    parts.push(`This session, intentionally test their known weakness: ${ctx.targetWeakness}.`);
  }
  if (ctx.daysSinceActive > 0) {
    parts.push(`The user has not practiced in ${ctx.daysSinceActive} days. If this is greater than 3, gently acknowledge the gap and encourage reconnecting with practice.`);
  }
  if (ctx.recentSpark) {
    parts.push(`The user previously demonstrated a hidden strength: "${ctx.recentSpark}". Find an opportunity to reinforce or build on this.`);
  }
  return parts.join("\n\n");
}
