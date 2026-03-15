/**
 * Central Brain: read opportunity_staging, LLM extracts Opportunity Vector, write to opportunities with embedding.
 * Run as batch (cron/scheduler). Owner: Agent 1 (Integrations & profile data)
 */
import { getSql } from "../db";
import { embeddingToVectorLiteral } from "../db";
import { getEmbedding } from "../extract-insights";
import { getOpenAIClient } from "../openai";

const COMPETENCY_NAMES =
  "Communication, STAR Method Structuring, Leadership, Teamwork, Conflict Resolution, Problem Solving, Adaptability, Quantifying Impact, Passive Language Avoidance";

const EXTRACTION_SYSTEM = `You extract structured opportunity data from raw scraped text for a career platform.
Output valid JSON only, with exactly these keys:
- title: string (short, e.g. "Deloitte Consulting Workshop")
- description: string (2-4 sentences summarizing the opportunity and who it's for)
- required_competencies: array of strings. Use ONLY these names: ${COMPETENCY_NAMES}. Pick the 1-4 most relevant.
- urgency: string, one of: "low", "medium", "high", or "unknown"
- source_display: string (e.g. "Deloitte", "Hackathon") for display
- opens_at: string or null. ISO 8601 date when applications/registration opens (e.g. "2026-01-15"). null if unknown.
- closes_at: string or null. ISO 8601 date when applications/registration closes or deadline (e.g. "2026-02-28"). null if unknown.

If the text is not about a job/workshop/event/opportunity, return {"skip": true}.`;

type StagingRow = { id: string; source: string; url: string | null; raw_text: string };

async function getUnprocessedStagingRows(limit: number): Promise<StagingRow[]> {
  const sql = getSql();
  if (!sql) return [];
  const sqlWithQuery = sql as unknown as {
    query: (q: string, p: number[]) => Promise<Record<string, unknown>[]>;
  };
  const rows = await sqlWithQuery.query(
    `SELECT s.id, s.source, s.url, s.raw_text
     FROM opportunity_staging s
     WHERE NOT EXISTS (SELECT 1 FROM opportunities o WHERE o.staging_id = s.id)
     ORDER BY s.fetched_at ASC
     LIMIT $1`,
    [limit]
  );
  const list = Array.isArray(rows) ? rows : [];
  return list.map((r: Record<string, unknown>) => ({
    id: String(r.id),
    source: String(r.source),
    url: r.url != null ? String(r.url) : null,
    raw_text: String(r.raw_text),
  }));
}

type ExtractedOpportunity = {
  skip?: boolean;
  title: string;
  description: string;
  required_competencies: string[];
  urgency: string;
  source_display: string;
  opens_at?: string | null;
  closes_at?: string | null;
};

async function extractOpportunityVector(rawText: string): Promise<ExtractedOpportunity | null> {
  const openai = getOpenAIClient();
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: EXTRACTION_SYSTEM },
      { role: "user", content: rawText.slice(0, 6000) },
    ],
    temperature: 0.2,
  });
  const content = completion.choices[0]?.message?.content?.trim() ?? "";
  try {
    const parsed = JSON.parse(content) as Record<string, unknown>;
    if (parsed.skip === true) return null;
    const opensAt = parsed.opens_at != null && parsed.opens_at !== "" ? String(parsed.opens_at) : null;
    const closesAt = parsed.closes_at != null && parsed.closes_at !== "" ? String(parsed.closes_at) : null;
    return {
      title: String(parsed.title ?? "Opportunity"),
      description: String(parsed.description ?? ""),
      required_competencies: Array.isArray(parsed.required_competencies)
        ? (parsed.required_competencies as string[]).filter((x) => typeof x === "string")
        : [],
      urgency: String(parsed.urgency ?? "unknown"),
      source_display: String(parsed.source_display ?? "Unknown"),
      opens_at: opensAt,
      closes_at: closesAt,
    };
  } catch {
    return null;
  }
}

function parseOptionalTimestamp(s: string | null | undefined): string | null {
  if (s == null || s === "") return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

/**
 * Process one staging row: extract vector, embed, insert into opportunities.
 */
async function processStagingRow(row: StagingRow): Promise<boolean> {
  const extracted = await extractOpportunityVector(row.raw_text);
  if (!extracted) return false;

  const textForEmbedding = [extracted.title, extracted.description, ...extracted.required_competencies].join(" ");
  const embedding = await getEmbedding(textForEmbedding);
  const vectorLiteral = embeddingToVectorLiteral(embedding);

  const sql = getSql();
  if (!sql) return false;
  const sqlWithQuery = sql as unknown as {
    query: (q: string, p: (string | number | null)[]) => Promise<unknown>;
  };
  const competenciesJson = JSON.stringify(extracted.required_competencies);
  const contentType = row.source === "rss" ? "trend" : "opportunity";
  const metadata = JSON.stringify({ source_display: extracted.source_display, content_type: contentType });
  const opensAt = parseOptionalTimestamp(extracted.opens_at ?? null);
  const closesAt = parseOptionalTimestamp(extracted.closes_at ?? null);
  await sqlWithQuery.query(
    `INSERT INTO opportunities (staging_id, title, description, url, source, required_competencies, urgency, metadata, opens_at, closes_at, embedding)
     VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8::jsonb, $9::timestamptz, $10::timestamptz, $11::vector)`,
    [
      row.id,
      extracted.title,
      extracted.description,
      row.url,
      row.source,
      competenciesJson,
      extracted.urgency,
      metadata,
      opensAt,
      closesAt,
      vectorLiteral,
    ]
  );
  return true;
}

/**
 * Run Brain: process up to limit unprocessed staging rows.
 */
export async function runBrain(limit = 20): Promise<{ processed: number; skipped: number }> {
  const rows = await getUnprocessedStagingRows(limit);
  let processed = 0;
  let skipped = 0;
  for (const row of rows) {
    const ok = await processStagingRow(row);
    if (ok) processed++;
    else skipped++;
  }
  return { processed, skipped };
}
