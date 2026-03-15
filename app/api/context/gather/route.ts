import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOrCreateUserByEmail } from "@/lib/db-users";
import { insertGatheredContext } from "@/lib/db-gathered-context";
import { extractGatheredContext } from "@/lib/extract-gathered-context";

type Message = { role: string; content: string };

function toTranscript(messages: Message[]): string {
  return messages
    .map((m) => `${m.role === "user" ? "Candidate" : "Interviewer"}: ${(m.content ?? "").trim()}`)
    .join("\n\n");
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const messages = Array.isArray(body.messages) ? (body.messages as Message[]) : [];
    const sessionFocus =
      typeof body.sessionFocus === "string" ? body.sessionFocus.trim() || undefined : undefined;

    if (messages.length < 2) {
      return NextResponse.json(
        { error: "Need at least 2 messages (e.g. assistant warm-up, user answer)" },
        { status: 400 }
      );
    }

    const userId = await getOrCreateUserByEmail(session.user.email);
    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const transcript = toTranscript(messages.slice(0, 6));
    const contextJson = await extractGatheredContext(transcript, sessionFocus);
    if (Object.keys(contextJson).length === 0) {
      return NextResponse.json({ saved: true });
    }

    const id = await insertGatheredContext(
      userId,
      "mock_interview_warmup",
      sessionFocus ?? null,
      contextJson as Record<string, unknown>
    );
    return NextResponse.json({ saved: true, id: id ?? undefined });
  } catch (err) {
    console.error("Context gather error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gather failed" },
      { status: 500 }
    );
  }
}
