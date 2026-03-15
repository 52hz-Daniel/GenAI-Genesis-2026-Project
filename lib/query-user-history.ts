import { getSql } from "./db";
import { getCompetencyIdByName } from "./db-competencies";
import { getEmbedding } from "./extract-insights";

export type UserHistoryItem = {
  evidence_quote: string;
  socratic_feedback_given: string | null;
  created_at: string;
};

/**
 * Query past insights for a user and competency. Uses vector similarity with time-weighted decay.
 * Returns up to limit items (default 3) for the agent to use in dialogue.
 */
export async function queryUserHistory(
  userId: string,
  competencyName: string,
  limit = 3
): Promise<UserHistoryItem[]> {
  const sql = getSql();
  if (!sql) return [];
  const competencyId = await getCompetencyIdByName(competencyName);
  if (!competencyId) return [];

  const queryEmbedding = await getEmbedding(competencyName + " behavioral insight");
  const vectorLiteral = `[${queryEmbedding.join(",")}]`;

  const sqlWithQuery = sql as unknown as {
    query: (q: string, p: (string | number)[]) => Promise<Record<string, unknown>[]>;
  };
  const rows = await sqlWithQuery.query(
    `SELECT evidence_quote, socratic_feedback_given, created_at
     FROM session_insights
     WHERE user_id = $1 AND competency_id = $2 AND embedding IS NOT NULL
     ORDER BY (1 - (embedding <=> $3::vector)) * EXP(-EXTRACT(EPOCH FROM (NOW() - created_at)) / (30.0 * 86400)) DESC
     LIMIT $4`,
    [userId, competencyId, vectorLiteral, limit]
  );

  const list = Array.isArray(rows) ? rows : [];
  return list.map((r: Record<string, unknown>) => ({
    evidence_quote: String(r.evidence_quote ?? ""),
    socratic_feedback_given: r.socratic_feedback_given != null ? String(r.socratic_feedback_given) : null,
    created_at: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
  }));
}
