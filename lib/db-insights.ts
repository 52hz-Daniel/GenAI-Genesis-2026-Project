import { getSql } from "./db";
import { embeddingToVectorLiteral } from "./db";

export type SessionInsightRow = {
  id: string;
  session_id: string;
  user_id: string;
  competency_id: string | null;
  score: number | null;
  insight_type: string;
  evidence_quote: string | null;
  socratic_feedback_given: string | null;
  created_at: Date;
};

/** Insert one session_insight with embedding. */
export async function insertSessionInsight(
  sessionId: string,
  userId: string,
  competencyId: string | null,
  score: number | null,
  insightType: string,
  evidenceQuote: string | null,
  socraticFeedbackGiven: string | null,
  embedding: number[]
): Promise<void> {
  const sql = getSql();
  if (!sql) return;
  const vectorLiteral = embeddingToVectorLiteral(embedding);
  await (sql as unknown as { query: (q: string, p: unknown[]) => Promise<unknown> }).query(
    `INSERT INTO session_insights (session_id, user_id, competency_id, score, insight_type, evidence_quote, socratic_feedback_given, embedding)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8::vector)`,
    [sessionId, userId, competencyId, score, insightType, evidenceQuote, socraticFeedbackGiven, vectorLiteral]
  );
}
