import { NextRequest, NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/openai";
import { stripStructuredDelimiters } from "@/lib/parse-feedback-blocks";

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
    const profileSummary = typeof body.profileSummary === "string" ? body.profileSummary : "";
    const openai = getOpenAIClient();
    const transcript = messages
      .map((m) => {
        let text = (m.content ?? "").replace(/BADGE_UNLOCKED/g, "").trim();
        if (m.role !== "user") text = stripStructuredDelimiters(text);
        return `${m.role === "user" ? "Candidate" : "Interviewer"}: ${text}`;
      })
      .join("\n\n");

    const transcriptSlice = transcript.slice(0, 12000);

    const [internalCompletion, userCompletion] = await Promise.all([
      openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are summarizing a mock behavioral interview for internal AI memory. Output a short markdown note with these sections (use ## for section headers):
## What we discussed
1-2 lines per question: what the question was and a brief summary of the candidate's answer.

## Feedback and takeaways
Key points the interviewer highlighted (strengths, suggestions).

## Strengths
1-3 bullets: what the candidate did well.

## Areas to improve
1-3 bullets: concrete, actionable things to work on. Be specific. Reference STAR when relevant. Keep it concise.`,
          },
          { role: "user", content: `Interview transcript:\n\n${transcriptSlice}` },
        ],
        temperature: 0.3,
      }),
      openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a professional tutor writing feedback for the candidate to read after their mock interview. Write in a warm, constructive tone. Consider the candidate's background and use clear language they can understand. Do not sound like internal notes—write as if speaking to the candidate.

Output short markdown with these sections (use ## for section headers):

## What we covered
Brief recap of the questions and your answers (1–2 lines per question).

## What went well
2–4 specific strengths. Be encouraging and name what they did right.

## Focus for next time
2–4 concrete, actionable improvements. Be specific and supportive (e.g. "Try adding one number to your result—time saved, team size, or percentage—so the impact is clear" rather than "improve result"). Mention STAR when relevant. Use language that feels like a tutor, not a checklist.

Keep it concise and easy to scan.${profileSummary ? `\n\nCandidate context (use to tailor language and examples): ${profileSummary}` : ""}`,
          },
          { role: "user", content: `Interview transcript:\n\n${transcriptSlice}` },
        ],
        temperature: 0.3,
      }),
    ]);

    const markdown = internalCompletion.choices[0]?.message?.content?.trim() ?? "";
    const userFeedback = userCompletion.choices[0]?.message?.content?.trim() ?? markdown;
    return NextResponse.json({ markdown, userFeedback });
  } catch (err) {
    console.error("Session notes error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Session notes failed" },
      { status: 500 }
    );
  }
}
