import { NextRequest, NextResponse } from "next/server";
import { getSessionLogById } from "@/lib/db-sessions";
import { getCompetencyIdByName } from "@/lib/db-competencies";
import { insertSessionInsight } from "@/lib/db-insights";
import { touchUserLastActive } from "@/lib/db-users";
import { extractSessionInsights, getEmbedding } from "@/lib/extract-insights";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const sessionId = typeof body.sessionId === "string" ? body.sessionId.trim() : null;
    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }
    const session = await getSessionLogById(sessionId);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }
    const { user_id: userId, raw_transcript: rawTranscript } = session;
    const insights = await extractSessionInsights(rawTranscript);
    for (const insight of insights) {
      const competencyId = await getCompetencyIdByName(insight.competency_name);
      const textToEmbed = [insight.evidence_quote, insight.socratic_feedback_given].filter(Boolean).join(" ");
      const embedding = await getEmbedding(textToEmbed);
      await insertSessionInsight(
        sessionId,
        userId,
        competencyId,
        insight.score,
        insight.insight_type,
        insight.evidence_quote,
        insight.socratic_feedback_given,
        embedding
      );
    }
    await touchUserLastActive(userId);
    return NextResponse.json({ ok: true, count: insights.length });
  } catch (err) {
    console.error("Extract insights error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Extraction failed" },
      { status: 500 }
    );
  }
}
