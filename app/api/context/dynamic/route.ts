import { NextRequest, NextResponse } from "next/server";
import { getDynamicContextForUser, formatDynamicContext, getSessionFocusLabel } from "@/lib/dynamic-prompt";
import { getEffectiveUser } from "@/lib/demo-judge";

export async function GET(request: NextRequest) {
  try {
    const effective = await getEffectiveUser(request);
    if (!effective?.email) {
      return NextResponse.json({ context: "", sessionFocusLabel: "" });
    }
    const ctx = await getDynamicContextForUser(effective.email);
    if (!ctx) {
      return NextResponse.json({ context: "", sessionFocusLabel: "" });
    }
    const context = formatDynamicContext(ctx);
    const sessionFocusLabel = getSessionFocusLabel(ctx);
    return NextResponse.json({ context, sessionFocusLabel });
  } catch {
    return NextResponse.json({ context: "", sessionFocusLabel: "" });
  }
}
