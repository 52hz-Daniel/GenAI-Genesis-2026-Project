import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUserByEmail } from "@/lib/db-users";
import { buildConfidenceDossier } from "@/lib/aggregation";
import { getEffectiveUser } from "@/lib/demo-judge";

/**
 * GET /api/aggregation/dossier?opportunity_id=...
 * Returns Confidence Dossier (competencyBridge, blindSpotWarning, socraticPrompt) for the opportunity and session user.
 */
export async function GET(req: NextRequest) {
  try {
    const effective = await getEffectiveUser(req);
    if (!effective?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const opportunityId = req.nextUrl.searchParams.get("opportunity_id");
    if (!opportunityId) {
      return NextResponse.json({ error: "Missing opportunity_id" }, { status: 400 });
    }
    const userId = await getOrCreateUserByEmail(effective.email);
    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const dossier = await buildConfidenceDossier(opportunityId, effective.email, userId);
    if (!dossier) {
      return NextResponse.json({ error: "Dossier not found or could not be generated" }, { status: 404 });
    }
    return NextResponse.json(dossier);
  } catch (e) {
    console.error("aggregation/dossier", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
