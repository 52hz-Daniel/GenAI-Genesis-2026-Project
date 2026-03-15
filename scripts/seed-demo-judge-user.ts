/**
 * Seeds the demo judge user (DEMO_JUDGE_EMAIL) with session_logs and session_insights
 * so Progress and dynamic context show realistic content when judges use "Experience as judge".
 * Run: npx tsx scripts/seed-demo-judge-user.ts
 * Requires: POSTGRES_URL. Optional: DEMO_JUDGE_EMAIL (defaults to demo-judge@aptitude.demo).
 * Load .env.local yourself (e.g. export $(cat .env.local | xargs) or use a tool that injects env).
 */
import { getSql, embeddingToVectorLiteral } from "../lib/db";
import { getOrCreateUserByEmail } from "../lib/db-users";
import { getCompetencyIdByName } from "../lib/db-competencies";
import { insertSessionInsight } from "../lib/db-insights";
import { getEmbedding } from "../lib/extract-insights";

const DEMO_EMAIL = process.env.DEMO_JUDGE_EMAIL ?? "demo-judge@aptitude.demo";

async function main() {
  const sql = getSql();
  if (!sql) {
    console.error("FAIL: POSTGRES_URL not set or DB unavailable.");
    process.exit(1);
  }

  const userId = await getOrCreateUserByEmail(DEMO_EMAIL);
  if (!userId) {
    console.error("FAIL: Could not get or create demo user.");
    process.exit(1);
  }
  console.log("Demo user:", DEMO_EMAIL, "id:", userId);

  const commId = await getCompetencyIdByName("Communication");
  const starId = await getCompetencyIdByName("STAR Method Structuring");
  const leadId = await getCompetencyIdByName("Leadership");
  if (!commId || !starId || !leadId) {
    console.error("FAIL: Competencies not found. Run schema-memory.sql.");
    process.exit(1);
  }

  const sessionRows = await sql`
    INSERT INTO session_logs (user_id, session_type, raw_transcript)
    VALUES (${userId}, 'mock_interview', 'Coach: Tell me about a time you had to work with a difficult teammate. Candidate: Well it was back in my second year and we had this group project and honestly I just tried to keep things moving and we got it done in the end.')
    RETURNING id`;
  const sessionId = (Array.isArray(sessionRows) ? sessionRows[0] : sessionRows) as { id: string } | undefined;
  if (!sessionId?.id) {
    console.error("FAIL: Could not insert session_log.");
    process.exit(1);
  }

  const weaknessQuote = "I just tried to keep things moving and we got it done in the end.";
  const strengthQuote = "I took the lead on the research section and shared a doc so everyone could edit.";
  let emb: number[] | null = null;
  try {
    emb = await getEmbedding(weaknessQuote + " Consider stating your main point first.");
  } catch {
    console.log("Skip embedding (OPENAI_API_KEY?); inserting without embedding.");
  }

  if (emb) {
    await insertSessionInsight(
      sessionId.id,
      userId,
      commId,
      2,
      "weakness",
      weaknessQuote,
      "Consider stating your main point first.",
      emb
    );
  } else {
    await sql`
      INSERT INTO session_insights (session_id, user_id, competency_id, score, insight_type, evidence_quote, socratic_feedback_given)
      VALUES (${sessionId.id}, ${userId}, ${commId}, 2, 'weakness', ${weaknessQuote}, 'Consider stating your main point first.')`;
  }

  await sql`
    INSERT INTO session_insights (session_id, user_id, competency_id, score, insight_type, evidence_quote, socratic_feedback_given)
    VALUES (${sessionId.id}, ${userId}, ${leadId}, 4, 'strength', ${strengthQuote}, 'Good ownership.')`;

  let oppEmbedding: number[] | null = null;
  try {
    oppEmbedding = await getEmbedding(
      "career opportunity workshop internship student leadership communication behavioral interview"
    );
  } catch {
    console.log("Skip opportunity embedding; Community feed may be empty until aggregation runs.");
  }
  if (oppEmbedding) {
    const sqlWithQuery = sql as unknown as {
      query: (q: string, p: (string | number | null)[]) => Promise<unknown>;
    };
    const vectorLiteral = embeddingToVectorLiteral(oppEmbedding);
    const metadata = JSON.stringify({ content_type: "opportunity", source_display: "Demo" });
    const competencies = JSON.stringify(["Communication", "Leadership"]);
    await sqlWithQuery.query(
      `INSERT INTO opportunities (title, description, url, source, required_competencies, metadata, embedding)
       VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7::vector)`,
      [
        "Campus Leadership Program",
        "A semester-long program for students to lead a team project. Great for building communication and ownership.",
        "https://example.com/leadership",
        "demo",
        competencies,
        metadata,
        vectorLiteral,
      ]
    );
    await sqlWithQuery.query(
      `INSERT INTO opportunities (title, description, url, source, required_competencies, metadata, embedding)
       VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7::vector)`,
      [
        "Behavioral Interview Prep Workshop",
        "Practice STAR stories and get feedback. Fits your focus on communication and structure.",
        "https://example.com/workshop",
        "demo",
        competencies,
        metadata,
        vectorLiteral,
      ]
    );
    console.log("Seeded 2 demo opportunities for Community feed.");
  }

  console.log("Seeded 1 session and 2 insights for", DEMO_EMAIL);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
