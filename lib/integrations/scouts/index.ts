/**
 * Scout adapters: fetch raw content from allowed sources only and write to opportunity_staging.
 * Invoked by cron or scheduler. Owner: Agent 1 (Integrations & profile data)
 *
 * Sourcing policy: see docs/community-sources-policy.md. We do not scrape LinkedIn, X, Reddit, or ToS-prohibited platforms.
 */
import { insertStagingRows } from "../staging";
import type { StagingInsert } from "../staging";

/** Allowed source type identifiers. Only these are used for ingestion. */
export const ALLOWED_SOURCE_TYPES = [
  "stub",
  "event_url",
  "urls",
  "rss",
  "api",
  "curated",
] as const;

export type AllowedSourceType = (typeof ALLOWED_SOURCE_TYPES)[number];

export function isAllowedSourceType(source: string): source is AllowedSourceType {
  return (ALLOWED_SOURCE_TYPES as readonly string[]).includes(source);
}

/**
 * Stub scout: inserts sample opportunities for development/demo.
 * Replace or supplement with real scrapers (hackathon sites, event pages, etc.).
 */
export async function runStubScout(): Promise<number> {
  const samples: StagingInsert[] = [
    {
      source: "stub",
      url: "https://example.com/deloitte-workshop",
      raw_text: "Deloitte Consulting Workshop. Date: Next month. Focus: analytical problem solving, client-facing communication. Apply by end of week. Big 4 brand, competitive.",
    },
    {
      source: "stub",
      url: "https://example.com/tech-hackathon",
      raw_text: "Tech Hackathon 2025. Looking for team players with problem solving and adaptability. 48-hour event. Good for students interested in product and engineering.",
    },
    {
      source: "stub",
      url: "https://example.com/leadership-panel",
      raw_text: "Leadership in Finance panel. Networking opportunity. Requires communication and quantifying impact. Industry: Finance.",
    },
  ];
  return insertStagingRows(samples);
}

/**
 * Fetch a URL and extract text (strip HTML). Use for simple event pages.
 */
export async function fetchUrlAsText(url: string): Promise<string> {
  const res = await fetch(url, { headers: { "User-Agent": "AptitudeAI-Scout/1.0" }, next: { revalidate: 0 } });
  if (!res.ok) return "";
  const html = await res.text();
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 15000);
}

/**
 * Run a single URL scout: fetch and push to staging.
 */
export async function runUrlScout(source: string, url: string): Promise<number> {
  const raw_text = await fetchUrlAsText(url);
  if (!raw_text) return 0;
  const count = await insertStagingRows([{ source, url, raw_text }]);
  return count;
}

/**
 * Parse SCOUT_URLS: JSON array of strings or newline-separated URLs.
 * Each entry can be a URL string or "source:url" for a custom source label.
 */
function parseScoutUrls(): { source: string; url: string }[] {
  const raw = process.env.SCOUT_URLS;
  if (!raw || !raw.trim()) return [];
  const out: { source: string; url: string }[] = [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) {
      for (const item of parsed) {
        if (typeof item === "string" && item.trim()) {
          const idx = item.indexOf(":");
          if (idx > 0 && !item.startsWith("http")) {
            out.push({ source: item.slice(0, idx).trim(), url: item.slice(idx + 1).trim() });
          } else {
            out.push({ source: "urls", url: item.trim() });
          }
        }
      }
      return out;
    }
  } catch {
    // not JSON, try newline-separated
  }
  for (const line of raw.split(/\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const idx = trimmed.indexOf(":");
    if (idx > 0 && !trimmed.startsWith("http")) {
      out.push({ source: trimmed.slice(0, idx).trim(), url: trimmed.slice(idx + 1).trim() });
    } else {
      out.push({ source: "urls", url: trimmed });
    }
  }
  return out;
}

/**
 * Fetch RSS/Atom feed URL and push each item (title + description + link) to staging.
 * Allowed source type: rss. Uses simple parsing; for complex feeds consider a dedicated parser.
 */
export async function runRssScout(feedUrl: string, sourceLabel = "rss"): Promise<number> {
  const res = await fetch(feedUrl, { headers: { "User-Agent": "AptitudeAI-Scout/1.0" }, next: { revalidate: 0 } });
  if (!res.ok) return 0;
  const xml = await res.text();
  const items = parseRssOrAtomItems(xml);
  if (items.length === 0) return 0;
  const rows: StagingInsert[] = items.map((item) => ({
    source: sourceLabel,
    url: item.link ?? undefined,
    raw_text: [item.title, item.description].filter(Boolean).join("\n\n"),
  }));
  return insertStagingRows(rows);
}

function parseRssOrAtomItems(xml: string): { title: string; description: string; link: string | null }[] {
  const items: { title: string; description: string; link: string | null }[] = [];
  const itemRegex = /<(?:item|entry)(?:\s[^>]*)?>([\s\S]*?)<\/(?:item|entry)>/gi;
  let block: RegExpExecArray | null;
  while ((block = itemRegex.exec(xml)) !== null) {
    const inner = block[1];
    const title = extractTag(inner, "title") ?? extractTag(inner, "content")?.replace(/<[^>]+>/g, " ").trim().slice(0, 500) ?? "";
    const description = extractTag(inner, "description") ?? extractTag(inner, "summary") ?? "";
    const link = extractTag(inner, "link");
    const linkHref = link?.match(/href=["']([^"']+)["']/)?.[1] ?? (link?.startsWith("http") ? link : null);
    items.push({ title: title.slice(0, 500), description: description.slice(0, 8000), link: linkHref ?? null });
  }
  return items;
}

function extractTag(inner: string, tag: string): string | null {
  const re = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, "i");
  const m = inner.match(re);
  if (!m) return null;
  return m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim();
}

/**
 * Run all configured scouts. Add more sources here (APIs, etc.).
 * Set SCOUT_INCLUDE_STUB=1 to include sample data (e.g. for dev/demo).
 * SCOUT_URLS: JSON array or newline-separated URLs; optional "source:url" per line.
 * SCOUT_RSS_URL: single RSS/Atom feed URL to ingest.
 */
export async function runAllScouts(): Promise<{ stub: number; url: number; rss: number }> {
  let stub = 0;
  if (process.env.SCOUT_INCLUDE_STUB === "1") {
    stub = await runStubScout();
  }
  const urlSources: { source: string; url: string }[] = [];
  if (process.env.SCOUT_EVENT_URL) {
    urlSources.push({ source: "event_url", url: process.env.SCOUT_EVENT_URL });
  }
  urlSources.push(...parseScoutUrls());
  let url = 0;
  for (const { source, url: u } of urlSources) {
    url += await runUrlScout(source, u);
  }
  let rss = 0;
  if (process.env.SCOUT_RSS_URL) {
    rss = await runRssScout(process.env.SCOUT_RSS_URL, "rss");
  }
  return { stub, url, rss };
}
