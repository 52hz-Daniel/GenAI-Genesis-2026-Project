/**
 * Sector 4: Live interview rapport and opening context.
 * Read-only: queries session_logs to build personalized opening guidance.
 */
import { getSql } from "./db";

/**
 * Build a short "rapport and opening" string for the live interviewer prompt.
 * Uses last session recency so the AI can open with context-aware lines
 * (e.g. "Good to see you again so soon" when they just practiced).
 */
export async function getLiveRapportContext(userId: string): Promise<string> {
  const sql = getSql();
  if (!sql) {
    return "Opening: No session history available. Give a warm, brief intro, use the candidate's name if provided in the profile below, and set the stage for the 30-minute interview.";
  }

  const rows = await sql`
    SELECT created_at FROM session_logs
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT 1
  `;
  const row = Array.isArray(rows) ? rows[0] : rows;
  const lastAt = (row as { created_at: Date } | undefined)?.created_at;
  if (!lastAt) {
    return "Opening: No prior sessions in our system. Give a warm, brief intro, use the candidate's name if provided in the profile below, and set the stage for the 30-minute interview.";
  }

  const now = new Date();
  const diffMs = now.getTime() - new Date(lastAt).getTime();
  const diffMins = Math.floor(diffMs / (60 * 1000));
  const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

  if (diffMins < 60) {
    return `Opening: Their last practice was ${diffMins} minute${diffMins === 1 ? "" : "s"} ago. Open with a brief, warm line like "Good to see you again so soon" or "Back for another round," then move to your first behavioral question.`;
  }
  if (diffHours < 24) {
    return `Opening: Their last practice was ${diffHours} hour${diffHours === 1 ? "" : "s"} ago. Acknowledge they are building momentum (e.g. "Good to see you again") and then move to your first question.`;
  }
  if (diffDays <= 5) {
    return `Opening: They last practiced ${diffDays} day${diffDays === 1 ? "" : "s"} ago. Give a brief, warm welcome and then your first behavioral question.`;
  }
  return `Opening: They have not practiced in ${diffDays} days. Ease them in gently and acknowledge it is good to have them back, then move to your first question.`;
}
