import { getSql } from "./db";

export type GatheredContextRow = {
  id: string;
  user_id: string;
  source: string;
  topic_or_focus: string | null;
  context_json: Record<string, unknown>;
  created_at: Date;
};

/**
 * Insert a row into user_gathered_context. Returns the new row id or null if no DB.
 */
export async function insertGatheredContext(
  userId: string,
  source: string,
  topicOrFocus: string | null,
  contextJson: Record<string, unknown>
): Promise<string | null> {
  const sql = getSql();
  if (!sql) return null;
  const jsonStr = JSON.stringify(contextJson);
  const rows = await sql`
    INSERT INTO user_gathered_context (user_id, source, topic_or_focus, context_json)
    VALUES (${userId}, ${source}, ${topicOrFocus}, ${jsonStr}::jsonb)
    RETURNING id`;
  const row = Array.isArray(rows) ? rows[0] : rows;
  return (row as { id: string } | undefined)?.id ?? null;
}

/**
 * Get the latest user_gathered_context row for a user (for injection into dynamic context).
 * Returns null if the table does not exist or the query fails (e.g. schema not yet applied).
 */
export async function getLatestGatheredContext(userId: string): Promise<GatheredContextRow | null> {
  const sql = getSql();
  if (!sql) return null;
  try {
    const rows = await sql`
      SELECT id, user_id, source, topic_or_focus, context_json, created_at
      FROM user_gathered_context
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 1`;
    const row = Array.isArray(rows) ? rows[0] : rows;
    if (!row || typeof row !== "object") return null;
    const r = row as Record<string, unknown>;
    return {
      id: String(r.id ?? ""),
      user_id: String(r.user_id ?? ""),
      source: String(r.source ?? ""),
      topic_or_focus: r.topic_or_focus != null ? String(r.topic_or_focus) : null,
      context_json: (r.context_json as Record<string, unknown>) ?? {},
      created_at: r.created_at instanceof Date ? r.created_at : new Date(String(r.created_at)),
    };
  } catch {
    return null;
  }
}
