import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOrCreateUserByEmail } from "@/lib/db-users";
import { createSessionLog } from "@/lib/db-sessions";
import { stripStructuredDelimiters } from "@/lib/parse-feedback-blocks";

type Message = { role: string; content: string };

function toRawTranscript(messages: Message[]): string {
  return messages
    .map((m) => {
      let text = (m.content ?? "").replace(/BADGE_UNLOCKED/g, "").trim();
      if (m.role !== "user") text = stripStructuredDelimiters(text);
      return `${m.role === "user" ? "Candidate" : "Interviewer"}: ${text}`;
    })
    .join("\n\n");
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ saved: false });
    }
    const body = await request.json();
    const messages = Array.isArray(body.messages) ? (body.messages as Message[]) : [];
    if (messages.length === 0) {
      return NextResponse.json({ saved: false });
    }
    const userId = await getOrCreateUserByEmail(session.user.email);
    if (!userId) {
      return NextResponse.json({ saved: false });
    }
    const rawTranscript = toRawTranscript(messages);
    const sessionId = await createSessionLog(userId, "mock_interview", rawTranscript);
    if (!sessionId) {
      return NextResponse.json({ saved: false });
    }
    const baseUrl = process.env.NEXTAUTH_URL ?? request.nextUrl.origin;
    fetch(`${baseUrl}/api/extract-insights`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    }).catch(() => {});
    return NextResponse.json({ saved: true, sessionId });
  } catch {
    return NextResponse.json({ saved: false });
  }
}
