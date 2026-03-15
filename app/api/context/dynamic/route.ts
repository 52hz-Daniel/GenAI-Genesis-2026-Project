import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDynamicContextForUser, formatDynamicContext, getSessionFocusLabel } from "@/lib/dynamic-prompt";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ context: "", sessionFocusLabel: "" });
    }
    const ctx = await getDynamicContextForUser(session.user.email);
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
