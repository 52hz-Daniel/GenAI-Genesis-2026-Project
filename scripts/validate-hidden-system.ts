/**
 * Automated validation for the hidden system (Loop B → dynamic context → Loop A).
 * Run from project root with: npx tsx scripts/validate-hidden-system.ts
 * Requires: POSTGRES_URL (or DATABASE_URL), and schema-memory.sql applied.
 * Optional: OPENAI_API_KEY for queryUserHistory check (embedding).
 *
 * 1. Seeds a test user + session_insights weakness (Communication).
 * 2. Asserts formatDynamicContext output contains the session focus line and target weakness.
 * 3. Asserts queryUserHistory returns the seeded evidence (skipped if no API key).
 */

import { getSql } from "../lib/db";
import { getOrCreateUserByEmail } from "../lib/db-users";
import { getCompetencyIdByName } from "../lib/db-competencies";
import { getDynamicContextForUser, formatDynamicContext } from "../lib/dynamic-prompt";
import { queryUserHistory } from "../lib/query-user-history";
import { getEmbedding } from "../lib/extract-insights";
import { insertSessionInsight } from "../lib/db-insights";

const TEST_EMAIL = "validation-test@example.com";
const EVIDENCE_QUOTE = "I kind of just talked about stuff and then we did the thing and it was good.";

async function main(): Promise<void> {
  const sql = getSql();
  if (!sql) {
    console.error("FAIL: POSTGRES_URL (or DATABASE_URL) not set or DB unavailable.");
    process.exit(1);
  }

  const userId = await getOrCreateUserByEmail(TEST_EMAIL);
  if (!userId) {
    console.error("FAIL: Could not get or create test user.");
    process.exit(1);
  }

  const competencyId = await getCompetencyIdByName("Communication");
  if (!competencyId) {
    console.error("FAIL: Competency 'Communication' not found. Run schema-memory.sql seed.");
    process.exit(1);
  }

  const sessionLogRows = await sql`
    INSERT INTO session_logs (user_id, session_type, raw_transcript)
    VALUES (${userId}, 'mock_interview', 'Coach: Tell me about a time... User: ' || ${EVIDENCE_QUOTE})
    RETURNING id`;
  const sessionRow = Array.isArray(sessionLogRows) ? sessionLogRows[0] : sessionLogRows;
  const sessionId = (sessionRow as { id: string } | undefined)?.id;
  if (!sessionId) {
    console.error("FAIL: Could not insert session_log.");
    process.exit(1);
  }

  let embedding: number[] | null = null;
  try {
    embedding = await getEmbedding([EVIDENCE_QUOTE, "Consider stating your main point first."].join(" "));
  } catch {
    console.log("Skip: No OPENAI_API_KEY or embedding failed; queryUserHistory check will be skipped.");
  }
  if (embedding) {
    await insertSessionInsight(
      sessionId,
      userId,
      competencyId,
      2,
      "weakness",
      EVIDENCE_QUOTE,
      "Consider stating your main point first.",
      embedding
    );
  } else {
    await sql`
      INSERT INTO session_insights (session_id, user_id, competency_id, score, insight_type, evidence_quote, socratic_feedback_given)
      VALUES (${sessionId}, ${userId}, ${competencyId}, 2, 'weakness', ${EVIDENCE_QUOTE}, 'Consider stating your main point first.')`;
  }

  const ctx = await getDynamicContextForUser(TEST_EMAIL);
  if (!ctx) {
    console.error("FAIL: getDynamicContextForUser returned null.");
    process.exit(1);
  }
  const contextStr = formatDynamicContext(ctx);
  if (!contextStr.includes("Session focus")) {
    console.error("FAIL: formatDynamicContext should include a session focus line. context (excerpt):", contextStr.slice(0, 300));
    process.exit(1);
  }
  console.log("OK: Dynamic context includes session focus line.");
  if (!ctx.targetWeakness || !contextStr.toLowerCase().includes(ctx.targetWeakness.toLowerCase())) {
    console.error("FAIL: formatDynamicContext should include target weakness. Got targetWeakness:", ctx.targetWeakness, "context (excerpt):", contextStr.slice(0, 200));
    process.exit(1);
  }
  console.log("OK: Dynamic context contains target weakness:", ctx.targetWeakness);

  if (embedding) {
    const history = await queryUserHistory(userId, "Communication", 3);
    const hasSeeded = history.some((h) => h.evidence_quote && h.evidence_quote.includes(EVIDENCE_QUOTE));
    if (!hasSeeded) {
      console.error("FAIL: queryUserHistory should return seeded evidence. Got:", JSON.stringify(history, null, 2));
      process.exit(1);
    }
    console.log("OK: queryUserHistory returned seeded evidence.");
  }

  console.log("All automated checks passed.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
