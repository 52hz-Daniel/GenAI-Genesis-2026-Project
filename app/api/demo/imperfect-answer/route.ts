import { NextRequest, NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/openai";

/**
 * POST /api/demo/imperfect-answer
 * Body: { question: string }
 * Returns a deliberately imperfect behavioral answer (for 3-min tour demo) so the coach can push back.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const question =
      typeof body.question === "string" ? body.question.trim() : "";
    if (!question) {
      return NextResponse.json(
        { error: "Missing question" },
        { status: 400 }
      );
    }

    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are generating a short behavioral answer that a candidate might give in a mock interview. The answer must be deliberately WEAK so that an elite coach would push back:
1. Do NOT state the main point or conclusion first. Start with a chronological ramble (e.g. "Well, it was back in my second year...").
2. Do NOT include any numbers or quantifiable results. Use vague phrases like "it went well", "we improved things", "we got it done" with no metrics.
3. Keep the answer to 2-4 sentences. Make it relevant to the question but flawed. Output only the candidate's answer, no quotes or labels.`,
        },
        {
          role: "user",
          content: `Interview question: ${question}\n\nGenerate a deliberately imperfect short answer (2-4 sentences) that a candidate might say. No conclusion first, no numbers. Only output the answer text.`,
        },
      ],
      temperature: 0.8,
    });

    const answer = completion.choices[0]?.message?.content?.trim() ?? "";
    return NextResponse.json({ answer });
  } catch (e) {
    console.error("imperfect-answer", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to generate answer" },
      { status: 500 }
    );
  }
}
