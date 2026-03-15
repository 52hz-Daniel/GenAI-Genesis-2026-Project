/**
 * Sector 4: Live interview TTS. Voice aligned with Realtime (alloy).
 * Use for cascaded path so tone matches S2S.
 */
import { NextRequest, NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/openai";

const LIVE_VOICE = "alloy";

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OPENAI_API_KEY is not set" }, { status: 500 });
    }
    const body = await request.json();
    const text = typeof body.text === "string" ? body.text.trim() : "";
    if (!text) {
      return NextResponse.json({ error: "Missing or empty text" }, { status: 400 });
    }
    const openai = getOpenAIClient();
    const speech = await openai.audio.speech.create({
      model: "tts-1",
      voice: LIVE_VOICE,
      input: text.slice(0, 4096),
    });
    const buffer = Buffer.from(await speech.arrayBuffer());
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("Live TTS error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "TTS failed" },
      { status: 500 }
    );
  }
}
