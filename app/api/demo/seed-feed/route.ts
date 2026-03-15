/**
 * POST /api/demo/seed-feed
 * Ensures the demo judge user has at least 2 opportunities in the feed (for demo tour).
 * Only callable when request is from demo judge (cookie set). Idempotent.
 */
import { NextRequest, NextResponse } from "next/server";
import { getEffectiveUser } from "@/lib/demo-judge";
import { getSql } from "@/lib/db";
import { getEmbedding } from "@/lib/extract-insights";
import { embeddingToVectorLiteral } from "@/lib/db";

const DEMO_SOURCE = "demo";

export async function POST(request: NextRequest) {
  const effective = await getEffectiveUser(request);
  const demoEmail = process.env.DEMO_JUDGE_EMAIL;
  if (!effective?.email || effective.email !== demoEmail) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const sql = getSql();
  if (!sql) {
    return NextResponse.json({ ok: false, message: "Database not configured" });
  }

  const sqlWithQuery = sql as unknown as {
    query: (q: string, p: (string | number)[]) => Promise<Record<string, unknown>[]>;
  };

  const existing = await sqlWithQuery.query(
    "SELECT id FROM opportunities WHERE source = $1 LIMIT 2",
    [DEMO_SOURCE]
  );
  if (Array.isArray(existing) && existing.length >= 2) {
    return NextResponse.json({ ok: true, seeded: false });
  }

  let embedding: number[];
  try {
    embedding = await getEmbedding(
      "career opportunity workshop internship student leadership communication behavioral interview"
    );
  } catch (e) {
    console.error("Demo seed-feed embedding error:", e);
    return NextResponse.json({ ok: false, error: "Embedding failed" }, { status: 500 });
  }

  const vectorLiteral = embeddingToVectorLiteral(embedding);
  const metadata = JSON.stringify({ content_type: "opportunity", source_display: "Demo" });
  const competencies = JSON.stringify(["Communication", "Leadership"]);

  try {
    await sqlWithQuery.query(
      `INSERT INTO opportunities (title, description, url, source, required_competencies, metadata, embedding)
       VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7::vector)`,
      [
        "Campus Leadership Program",
        "A semester-long program for students to lead a team project. Great for building communication and ownership.",
        "https://example.com/leadership",
        DEMO_SOURCE,
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
        DEMO_SOURCE,
        competencies,
        metadata,
        vectorLiteral,
      ]
    );
  } catch (e) {
    console.error("Demo seed-feed insert error:", e);
    return NextResponse.json({ ok: false, error: "Insert failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, seeded: true });
}
