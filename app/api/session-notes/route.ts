import { NextRequest, NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/openai";

type Message = { role: string; content: string };

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OPENAI_API_KEY is not set" }, { status: 500 });
    }
    const body = await request.json();
    const messages = Array.isArray(body.messages) ? (body.messages as Message[]) : [];
    if (messages.length === 0) {
      return NextResponse.json({ error: "Missing or empty messages" }, { status: 400 });
    }
    const openai = getOpenAIClient();
    const transcript = messages
      .map((m) => `${m.role === "user" ? "Candidate" : "Interviewer"}: ${(m.content ?? "").replace(/BADGE_UNLOCKED/g, "").trim()}`)
      .join("\n\n");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are summarizing a mock behavioral interview for the candidate's personal notes. Output a short markdown note with these sections (use ## for section headers):
## What we discussed
1-2 lines per question: what the question was and a brief summary of the candidate's answer.

## Feedback and takeaways
Key points the interviewer highlighted (strengths, suggestions).

## Strengths
1-3 bullets: what the candidate did well.

## Areas to improve
1-3 bullets: concrete things to work on (e.g. "Add more concrete results", "Use STAR structure more explicitly"). Be specific and actionable.

Output only the markdown, no preamble. Use commas instead of dashes. Keep it concise.`,
        },
        { role: "user", content: `Interview transcript:\n\n${transcript.slice(0, 12000)}` },
      ],
      temperature: 0.3,
    });
    const markdown = completion.choices[0]?.message?.content?.trim() ?? "";
    return NextResponse.json({ markdown });
  } catch (err) {
    console.error("Session notes error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Session notes failed" },
      { status: 500 }
    );
  }
}
