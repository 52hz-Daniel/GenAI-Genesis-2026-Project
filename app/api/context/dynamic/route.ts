import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDynamicContextForUser, formatDynamicContext } from "@/lib/dynamic-prompt";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ context: "" });
    }
    const ctx = await getDynamicContextForUser(session.user.email);
    if (!ctx) {
      return NextResponse.json({ context: "" });
    }
    const context = formatDynamicContext(ctx);
    return NextResponse.json({ context });
  } catch {
    return NextResponse.json({ context: "" });
  }
}
