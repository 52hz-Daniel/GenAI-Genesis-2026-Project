import { getSql } from "./db";
import { getUserByEmail } from "./db-users";
import { getLatestGatheredContext } from "./db-gathered-context";

export type DynamicContext = {
  daysSinceActive: number;
  targetWeakness: string | null;
  /** Second-ranked weakness for "next time we can focus on" continuity. */
  nextWeakness: string | null;
  recentSpark: string | null;
  /** Latest proactively gathered context (warm-up answers, etc.) for this user. */
  gatheredContext: { context_json: Record<string, unknown>; topic_or_focus: string | null } | null;
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
     LIMIT 2`,
    [userId]
  );
  const wList = Array.isArray(weaknessRows) ? weaknessRows : [];
  const targetWeakness = wList[0]?.name != null && String(wList[0].name).trim() ? String(wList[0].name).trim() : null;
  const nextWeakness = wList[1]?.name != null && String(wList[1].name).trim() ? String(wList[1].name).trim() : null;

  const sparkRows = await sql`SELECT evidence_quote FROM session_insights
    WHERE user_id = ${userId} AND (insight_type = 'hidden_spark' OR insight_type = 'strength')
    ORDER BY created_at DESC LIMIT 1`;
  const sparkRow = Array.isArray(sparkRows) ? sparkRows[0] : sparkRows;
  const recentSpark = (sparkRow as { evidence_quote: string } | undefined)?.evidence_quote ?? null;

  const gathered = await getLatestGatheredContext(userId);
  const gatheredContext = gathered
    ? { context_json: gathered.context_json, topic_or_focus: gathered.topic_or_focus }
    : null;

  return { daysSinceActive: days, targetWeakness, nextWeakness, recentSpark, gatheredContext };
}

/** Format dynamic context as a string for system prompt injection. */
export function formatDynamicContext(ctx: DynamicContext): string {
  const parts: string[] = [];
  const sessionFocus = ctx.targetWeakness
    ? `This session focus: ${ctx.targetWeakness}. Goal: ask questions that test this; give feedback that addresses it.`
    : "This session focus: align questions with the candidate's target role and stated improvement area (from candidate profile below).";
  parts.push("Session focus (use it; do not ask random questions): " + sessionFocus);
  parts.push(
    "Evaluate this user against the Pyramid Principle, MECE, and STAR with quantifiable Result. " +
    "Use the candidate profile (in the context below) to emphasize the most relevant framework (e.g. consulting: structure and MECE; PM: impact and prioritization; general: all three, with STAR Result always)."
  );
  if (ctx.targetWeakness) {
    parts.push(`This session, intentionally test their known weakness: ${ctx.targetWeakness}.`);
  }
  if (ctx.nextWeakness) {
    parts.push(`Next time we can focus on: ${ctx.nextWeakness}.`);
  }
  if (ctx.daysSinceActive > 0) {
    parts.push(`The user has not practiced in ${ctx.daysSinceActive} days. If this is greater than 3, gently acknowledge the gap and encourage reconnecting with practice.`);
  }
  if (ctx.recentSpark) {
    parts.push(`The user previously demonstrated a hidden strength: "${ctx.recentSpark}". Find an opportunity to reinforce or build on this.`);
  }
  if (ctx.gatheredContext && Object.keys(ctx.gatheredContext.context_json).length > 0) {
    const summary = Object.entries(ctx.gatheredContext.context_json)
      .filter(([, v]) => typeof v === "string" && v.trim().length > 0)
      .map(([k, v]) => `${k}: ${v}`)
      .join("; ");
    if (summary) {
      parts.push(`User has shared (from previous sessions): ${summary}. Use this to tailor questions and feedback.`);
    }
  }
  return parts.join("\n\n");
}

/** Return a short label for UI display (e.g. "Quantifying Impact" or "Your goals and improvement areas"). */
export function getSessionFocusLabel(ctx: DynamicContext): string {
  if (ctx.targetWeakness?.trim()) return ctx.targetWeakness.trim();
  return "Your goals and improvement areas";
}
