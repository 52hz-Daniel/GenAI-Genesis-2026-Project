import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOrCreateUserByEmail } from "@/lib/db-users";
import { buildConfidenceDossier } from "@/lib/aggregation";

/**
 * GET /api/aggregation/dossier?opportunity_id=...
 * Returns Confidence Dossier (competencyBridge, blindSpotWarning, socraticPrompt) for the opportunity and session user.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const opportunityId = req.nextUrl.searchParams.get("opportunity_id");
    if (!opportunityId) {
      return NextResponse.json({ error: "Missing opportunity_id" }, { status: 400 });
    }
    const userId = await getOrCreateUserByEmail(session.user.email);
    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const dossier = await buildConfidenceDossier(opportunityId, session.user.email, userId);
    if (!dossier) {
      return NextResponse.json({ error: "Dossier not found or could not be generated" }, { status: 404 });
    }
    return NextResponse.json(dossier);
  } catch (e) {
    console.error("aggregation/dossier", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
