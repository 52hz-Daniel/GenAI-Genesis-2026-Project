/**
 * Confidence Dossier: Competency Bridge, Blind Spot Warning, Socratic Decision Prompt.
 * Uses getDynamicContextForUser and session_insights; calls OpenAI for generation (own client, do not edit lib/openai.ts).
 */
import { getSql } from "../db";
import { getDynamicContextForUser } from "../dynamic-prompt";
import { getOpenAIClient } from "../openai";
import type { ConfidenceDossier } from "./types";

type OpportunityForDossier = {
  id: string;
  title: string;
  description: string | null;
  required_competencies: string[];
};

const DOSSIER_SYSTEM = `You are a Socratic career coach. Generate a Confidence Dossier for a user about a specific opportunity.

Output valid JSON only, with exactly these keys (all strings):
- competencyBridge: 2-4 sentences. Use the user's past evidence (quotes from their mock interviews) to show why they are ready for this opportunity. Match the opportunity's required competencies to strengths they have already demonstrated. Be evidence-based; no hype.
- blindSpotWarning: 1-3 sentences. If the user has a known weakness that matches what this opportunity needs, state it clearly and specifically (e.g. "This role requires executive presentation. Our data shows you still struggle with the Pyramid Principle when speaking."). If there is no relevant blind spot, say something like "No major blind spot identified for this opportunity" but still be honest if there is a small gap.
- socraticPrompt: One open-ended question that asks the user to justify their decision. Do NOT suggest yes or no. Example: "Given that your technical skills align but your presentation skills need work before the interview date, does attending this event align with your goal of securing a role by November? Justify your decision."`;

function parseCompetencies(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.filter((x): x is string => typeof x === "string");
  return [];
}

/**
 * Load opportunity by id from DB.
 */
async function getOpportunityById(opportunityId: string): Promise<OpportunityForDossier | null> {
  const sql = getSql();
  if (!sql) return null;
  const rows = await sql`
    SELECT id, title, description, required_competencies
    FROM opportunities
    WHERE id = ${opportunityId}
  `;
  const row = Array.isArray(rows) ? rows[0] : rows;
  if (!row || typeof row !== "object") return null;
  const r = row as Record<string, unknown>;
  return {
    id: String(r.id),
    title: String(r.title),
    description: r.description != null ? String(r.description) : null,
    required_competencies: parseCompetencies(r.required_competencies),
  };
}

/**
 * Load recent strength/weakness evidence for user for dossier context.
 */
async function getEvidenceForUser(userId: string): Promise<{ strengths: string[]; weakness: string | null }> {
  const sql = getSql();
  if (!sql) return { strengths: [], weakness: null };
  const sqlWithQuery = sql as unknown as {
    query: (q: string, p: string[]) => Promise<Record<string, unknown>[]>;
  };
  const strengthRows = await sqlWithQuery.query(
    `SELECT c.name, si.evidence_quote
     FROM session_insights si
     INNER JOIN competencies c ON c.id = si.competency_id
     WHERE si.user_id = $1 AND (si.insight_type = 'strength' OR si.insight_type = 'hidden_spark')
     ORDER BY si.created_at DESC LIMIT 3`,
    [userId]
  );
  const weaknessRows = await sqlWithQuery.query(
    `SELECT c.name, si.evidence_quote
     FROM session_insights si
     INNER JOIN competencies c ON c.id = si.competency_id
     WHERE si.user_id = $1 AND si.insight_type = 'weakness'
     ORDER BY si.created_at DESC LIMIT 1`,
    [userId]
  );
  const strengths = (Array.isArray(strengthRows) ? strengthRows : []).map(
    (x: Record<string, unknown>) => `${x.name}: ${String(x.evidence_quote ?? "").slice(0, 150)}`
  );
  const w = Array.isArray(weaknessRows) && weaknessRows[0] ? weaknessRows[0] : null;
  const weakness = w ? `${(w as Record<string, unknown>).name}: ${String((w as Record<string, unknown>).evidence_quote ?? "").slice(0, 150)}` : null;
  return { strengths, weakness };
}

/**
 * Generate Confidence Dossier for a user and opportunity. Returns null if missing data or OpenAI fails.
 */
export async function buildConfidenceDossier(
  opportunityId: string,
  email: string,
  userId: string
): Promise<ConfidenceDossier | null> {
  const [opportunity, ctx, evidence] = await Promise.all([
    getOpportunityById(opportunityId),
    getDynamicContextForUser(email),
    getEvidenceForUser(userId),
  ]);
  if (!opportunity) return null;

  const userContext = [
    ctx?.targetWeakness ? `Known weakness: ${ctx.targetWeakness}` : "",
    ctx?.recentSpark ? `Recent spark: ${ctx.recentSpark}` : "",
    evidence.strengths.length ? `Past strengths (evidence): ${evidence.strengths.join("; ")}` : "",
    evidence.weakness ? `Past weakness (evidence): ${evidence.weakness}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const openai = getOpenAIClient();
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: DOSSIER_SYSTEM },
      {
        role: "user",
        content: `Opportunity: ${opportunity.title}. ${opportunity.description ?? ""}. Required competencies: ${opportunity.required_competencies.join(", ") || "Not specified"}.\n\nUser context:\n${userContext || "No session data yet."}`,
      },
    ],
    temperature: 0.4,
  });
  const content = completion.choices[0]?.message?.content?.trim() ?? "";
  try {
    const parsed = JSON.parse(content) as Record<string, unknown>;
    return {
      competencyBridge: String(parsed.competencyBridge ?? ""),
      blindSpotWarning: String(parsed.blindSpotWarning ?? ""),
      socraticPrompt: String(parsed.socraticPrompt ?? ""),
    };
  } catch {
    return null;
  }
}
