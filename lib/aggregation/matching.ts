/**
 * Rank opportunities for a user: cosine similarity + anti-doomscroll (view-without-action penalty).
 * Cap at 5 items. Optimize for Application Velocity.
 */
import { getSql } from "../db";
import { getEmbedding } from "../extract-insights";
import { buildUserSummaryForMatching } from "./user-vector";
import type { OpportunityFeedItem, OpportunityContentType } from "./types";

const FEED_LIMIT = 5;
const CANDIDATE_POOL = 25;

/**
 * Get actions for user in the last 7 days (for penalty and collaborative signal).
 */
async function getUserActions(
  userId: string
): Promise<{ opportunity_id: string; action: string; created_at: Date }[]> {
  const sql = getSql();
  if (!sql) return [];
  const sqlWithQuery = sql as unknown as {
    query: (q: string, p: string[]) => Promise<Record<string, unknown>[]>;
  };
  const rows = await sqlWithQuery.query(
    `SELECT opportunity_id, action, created_at
     FROM user_opportunity_actions
     WHERE user_id = $1 AND created_at > NOW() - INTERVAL '7 days'
     ORDER BY created_at DESC`,
    [userId]
  );
  const list = Array.isArray(rows) ? rows : [];
  return list.map((r: Record<string, unknown>) => ({
    opportunity_id: String(r.opportunity_id),
    action: String(r.action),
    created_at: r.created_at instanceof Date ? r.created_at : new Date(String(r.created_at)),
  }));
}

/**
 * Parse required_competencies from JSONB (array of strings).
 */
function parseCompetencies(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.filter((x): x is string => typeof x === "string");
  if (raw && typeof raw === "object" && "competencies" in (raw as Record<string, unknown>)) {
    const arr = (raw as { competencies: unknown }).competencies;
    return Array.isArray(arr) ? arr.filter((x): x is string => typeof x === "string") : [];
  }
  return [];
}

/**
 * Rank and return top opportunities for the user. Uses user summary embedding and
 * penalizes opportunities the user viewed but did not apply/save/reject.
 * Optional contentType filter: "opportunity" | "trend" for a dedicated Trends section.
 */
export async function getRankedOpportunitiesForUser(
  userId: string,
  email: string,
  options?: { contentType?: OpportunityContentType }
): Promise<OpportunityFeedItem[]> {
  const sql = getSql();
  if (!sql) return [];

  const userSummary = await buildUserSummaryForMatching(email);
  const embedding = userSummary ? await getEmbedding(userSummary) : await getEmbedding("career opportunities workshop job");
  const vectorLiteral = `[${embedding.join(",")}]`;

  const sqlWithQuery = sql as unknown as {
    query: (q: string, p: (string | number | string)[]) => Promise<Record<string, unknown>[]>;
  };
  const contentTypeFilter = options?.contentType != null;
  const whereClause = contentTypeFilter
    ? "WHERE embedding IS NOT NULL AND (metadata->>'content_type') = $3"
    : "WHERE embedding IS NOT NULL";
  const params: (string | number)[] = [vectorLiteral, CANDIDATE_POOL];
  if (contentTypeFilter) params.push(options!.contentType!);
  const rows = await sqlWithQuery.query(
    `SELECT id, title, description, url, source, required_competencies, urgency, opens_at, closes_at, metadata, created_at
     FROM opportunities
     ${whereClause}
     ORDER BY (1 - (embedding <=> $1::vector)) DESC, created_at DESC
     LIMIT $2`,
    params
  );
  const candidates = Array.isArray(rows) ? rows : [];

  const actions = await getUserActions(userId);
  const viewOnlyByOpp = new Map<string, boolean>();
  const appliedSavedByOpp = new Set<string>();
  for (const a of actions) {
    if (a.action === "view") {
      viewOnlyByOpp.set(a.opportunity_id, true);
    } else if (a.action === "apply" || a.action === "save" || a.action === "reject") {
      appliedSavedByOpp.add(a.opportunity_id);
      viewOnlyByOpp.set(a.opportunity_id, false);
    }
  }
  for (const a of actions) {
    if (a.action === "view" && !appliedSavedByOpp.has(a.opportunity_id)) {
      viewOnlyByOpp.set(a.opportunity_id, true);
    }
  }

  const scored = candidates.map((r: Record<string, unknown>, index: number) => {
    const id = String(r.id);
    const viewOnly = viewOnlyByOpp.get(id);
    const penalty = viewOnly ? 0.5 : 0;
    const simScore = 1 - index / Math.max(candidates.length, 1);
    const score = Math.max(0, simScore - penalty);
    return { score, row: r };
  });
  scored.sort((a, b) => b.score - a.score);

  const result: OpportunityFeedItem[] = [];
  for (let i = 0; i < scored.length && result.length < FEED_LIMIT; i++) {
    const r = scored[i].row as Record<string, unknown>;
    const toIso = (v: unknown): string | null =>
      v == null ? null : v instanceof Date ? v.toISOString() : typeof v === "string" ? v : null;
    const meta = (r.metadata as Record<string, unknown> | undefined);
    const contentType = meta?.content_type === "trend" ? "trend" : "opportunity";
    result.push({
      id: String(r.id),
      title: String(r.title),
      description: r.description != null ? String(r.description) : null,
      url: r.url != null ? String(r.url) : null,
      source: String(r.source),
      required_competencies: parseCompetencies(r.required_competencies),
      urgency: r.urgency != null ? String(r.urgency) : null,
      opens_at: toIso(r.opens_at),
      closes_at: toIso(r.closes_at),
      content_type: contentType,
      created_at: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
    });
  }
  return result;
}
