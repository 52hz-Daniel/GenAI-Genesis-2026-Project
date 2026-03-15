/**
 * Sector 4: One cascaded turn (STT optional, LLM + TTS).
 * POST body: { history: { role, content }[], transcript?: string, audio?: base64 }.
 * Returns: { reply, audioBase64?, history }.
 */
import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUserByEmail } from "@/lib/db-users";
import { getDynamicContextForUser, formatDynamicContext } from "@/lib/dynamic-prompt";
import { getLiveRapportContext } from "@/lib/live-context";
import { getLiveInterviewReply } from "@/lib/live-agent";
import { getOpenAIClient } from "@/lib/openai";
import { getEffectiveUser } from "@/lib/demo-judge";

const LIVE_VOICE = "alloy";

export async function POST(request: NextRequest) {
  try {
    const effective = await getEffectiveUser(request);
    if (!effective?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const history = Array.isArray(body.history) ? body.history : [];
    let transcript: string | undefined =
      typeof body.transcript === "string" ? body.transcript.trim() : undefined;

    if (!transcript && body.audio) {
      const buf = Buffer.from(body.audio, "base64");
      const openai = getOpenAIClient();
      const file = new File([buf], "audio.webm", { type: "audio/webm" });
      const transcription = await openai.audio.transcriptions.create({
        file,
        model: "whisper-1",
      });
      transcript = transcription.text?.trim() ?? "";
    }

    if (!transcript) {
      return NextResponse.json({ error: "Missing transcript or audio" }, { status: 400 });
    }

    const userId = await getOrCreateUserByEmail(effective.email);
    const [ctx, rapportContext] = await Promise.all([
      getDynamicContextForUser(effective.email),
      userId ? getLiveRapportContext(userId) : Promise.resolve(""),
    ]);
    const dynamicContext = ctx ? formatDynamicContext(ctx) : "";
    const profileSummary = typeof body.profileSummary === "string" ? body.profileSummary : "";
    const memoryContext = typeof body.memoryContext === "string" ? body.memoryContext : "";
    const contextParts = [rapportContext, dynamicContext, profileSummary, memoryContext].filter(Boolean);
    const context = contextParts.length > 0 ? contextParts.join("\n\n") : undefined;

    const newHistory = [...history, { role: "user" as const, content: transcript }];
    const reply = await getLiveInterviewReply(newHistory, context, userId);

    let audioBase64: string | undefined;
    try {
      const openai = getOpenAIClient();
      const speech = await openai.audio.speech.create({
        model: "tts-1",
        voice: LIVE_VOICE,
        input: reply.slice(0, 4096),
      });
      const buffer = Buffer.from(await speech.arrayBuffer());
      audioBase64 = buffer.toString("base64");
    } catch {
      // omit audio on TTS failure
    }

    return NextResponse.json({
      reply,
      audioBase64,
      history: [...newHistory, { role: "assistant", content: reply }],
    });
  } catch (err) {
    console.error("Live turn error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Turn failed" },
      { status: 500 }
    );
  }
}
