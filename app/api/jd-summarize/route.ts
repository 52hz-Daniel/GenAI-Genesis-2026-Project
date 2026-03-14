import { NextRequest, NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/openai";

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OPENAI_API_KEY is not set" }, { status: 500 });
    }
    const body = await request.json();
    const jd = typeof body.jd === "string" ? body.jd.trim() : "";
    if (!jd) {
      return NextResponse.json({ error: "Missing or empty job description" }, { status: 400 });
    }
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Summarize the job description in 3 to 5 short bullet points: role, key responsibilities, desired skills or competencies, and any company/team context. Output only the bullet list, no preamble. Use commas instead of dashes.",
        },
        { role: "user", content: jd.slice(0, 15000) },
      ],
      temperature: 0.3,
    });
    const summary = completion.choices[0]?.message?.content?.trim() ?? "";
    return NextResponse.json({ summary });
  } catch (err) {
    console.error("JD summarize error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Summarization failed" },
      { status: 500 }
    );
  }
}
