import { NextRequest, NextResponse } from "next/server";
import { getResumeBullets } from "@/lib/openai";
import { getInterviewReplyWithAgent } from "@/lib/coach-agent";
import { getOrCreateUserByEmail } from "@/lib/db-users";
import { getEffectiveUser } from "@/lib/demo-judge";

type Body =
  | { type: "resume"; input: string }
  | {
      type: "interview";
      history: { role: "user" | "assistant"; content: string }[];
      context?: string;
      phase?: "warmup" | "post_warmup" | "main";
    };

export async function POST(request: NextRequest) {
  try {
    const body: Body = await request.json();
    if (body.type === "resume") {
      const { input } = body;
      if (!input || typeof input !== "string" || input.trim().length === 0) {
        return NextResponse.json({ error: "Missing or invalid input" }, { status: 400 });
      }
      const bullets = await getResumeBullets(input.trim());
      return NextResponse.json({ bullets });
    }
    if (body.type === "interview") {
      const { history, context, phase } = body;
      if (!Array.isArray(history)) {
        return NextResponse.json({ error: "Missing or invalid history" }, { status: 400 });
      }
      const effective = await getEffectiveUser(request);
      const userId = effective?.email ? await getOrCreateUserByEmail(effective.email) : null;
      const reply = await getInterviewReplyWithAgent(history, context, userId, phase);
      return NextResponse.json({ reply });
    }
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (err) {
    console.error("OpenAI API error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "AI request failed" },
      { status: 500 }
    );
  }
}
