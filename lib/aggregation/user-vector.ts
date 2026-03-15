/**
 * Build user summary for opportunity matching (embedding + cosine similarity).
 * Uses users, session_insights, and getDynamicContextForUser. Read-only from Agent 3 modules.
 */
import { getSql } from "../db";
import { getUserByEmail } from "../db-users";
import { getDynamicContextForUser } from "../dynamic-prompt";

/**
 * Build a single text summary of the user for embedding and matching to opportunities.
 * Includes target_industry, target weakness, recent spark, and competency strengths with evidence.
 */
export async function buildUserSummaryForMatching(email: string): Promise<string | null> {
  const user = await getUserByEmail(email);
  if (!user) return null;

  const ctx = await getDynamicContextForUser(email);
  const sql = getSql();
  if (!sql) return null;

  const sqlWithQuery = sql as unknown as {
    query: (q: string, p: string[]) => Promise<Record<string, unknown>[]>;
  };
  const strengthRows = await sqlWithQuery.query(
    `SELECT c.name, si.evidence_quote
     FROM session_insights si
     INNER JOIN competencies c ON c.id = si.competency_id
     WHERE si.user_id = $1 AND (si.insight_type = 'strength' OR si.insight_type = 'hidden_spark')
     ORDER BY si.created_at DESC
     LIMIT 5`,
    [user.id]
  );
  const strengths = Array.isArray(strengthRows) ? strengthRows : [];
  const strengthParts = strengths.map(
    (r: Record<string, unknown>) => `${r.name}: ${String(r.evidence_quote ?? "").slice(0, 200)}`
  );

  const parts: string[] = [];
  if (user.target_industry) parts.push(`Target industry: ${user.target_industry}.`);
  if (ctx?.targetWeakness) parts.push(`Known weakness to work on: ${ctx.targetWeakness}.`);
  if (ctx?.recentSpark) parts.push(`Recent strength or hidden spark: ${ctx.recentSpark}.`);
  if (strengthParts.length > 0) parts.push(`Demonstrated competencies: ${strengthParts.join(" ")}.`);

  if (parts.length === 0) return "Career-seeking user; no profile or session data yet.";
  return parts.join(" ");
}
