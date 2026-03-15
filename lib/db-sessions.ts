import { getSql } from "./db";

export type SessionLogRow = { id: string; user_id: string; session_type: string; raw_transcript: string; created_at: Date };

/** Create a session_log row. Returns session id or null if no DB. */
export async function createSessionLog(
  userId: string,
  sessionType: string,
  rawTranscript: string
): Promise<string | null> {
  const sql = getSql();
  if (!sql) return null;
  const rows = await sql`INSERT INTO session_logs (user_id, session_type, raw_transcript)
    VALUES (${userId}, ${sessionType}, ${rawTranscript})
    RETURNING id`;
  const row = Array.isArray(rows) ? rows[0] : rows;
  return (row as { id: string } | undefined)?.id ?? null;
}

/** Get session log by id (for background worker). */
export async function getSessionLogById(sessionId: string): Promise<SessionLogRow | null> {
  const sql = getSql();
  if (!sql) return null;
  const rows = await sql`SELECT id, user_id, session_type, raw_transcript, created_at FROM session_logs WHERE id = ${sessionId}`;
  const row = Array.isArray(rows) ? rows[0] : rows;
  return (row as SessionLogRow | undefined) ?? null;
}
