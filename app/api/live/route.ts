/**
 * Sector 4: Live interview API.
 * POST: create a Realtime session (ephemeral client secret) for the client to connect via WebRTC/WebSocket.
 */
import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUserByEmail } from "@/lib/db-users";
import { getDynamicContextForUser, formatDynamicContext } from "@/lib/dynamic-prompt";
import { getLiveRapportContext } from "@/lib/live-context";
import { getLiveInterviewerInstructionsForRealtime } from "@/lib/live-prompts";
import { getEffectiveUser } from "@/lib/demo-judge";

const REALTIME_VOICE = "alloy";

export async function GET() {
  return NextResponse.json(
    { error: "Use POST to create a live interview session (Sector 4)" },
    { status: 501 }
  );
}

export async function POST(request: NextRequest) {
  try {
    const effective = await getEffectiveUser(request);
    // #region agent log
    fetch('http://127.0.0.1:7683/ingest/9250a4a4-eabe-480a-9c5d-97ebeeafe803',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'6526e8'},body:JSON.stringify({sessionId:'6526e8',location:'app/api/live/route.ts:POST',message:'Live POST after getEffectiveUser',data:{hasEffective:!!effective,hasEmail:!!effective?.email,will401:!effective?.email},timestamp:Date.now(),hypothesisId:'H1-H5'})}).catch(()=>{});
    // #endregion
    if (!effective?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not set" },
        { status: 500 }
      );
    }

    const userId = await getOrCreateUserByEmail(effective.email);

    const [ctx, rapportContext] = await Promise.all([
      getDynamicContextForUser(effective.email),
      userId ? getLiveRapportContext(userId) : Promise.resolve(""),
    ]);
    const dynamicContext = ctx ? formatDynamicContext(ctx) : "";

    const body = await request.json().catch(() => ({}));
    const profileSummary = typeof body.profileSummary === "string" ? body.profileSummary : "";
    const memoryContext = typeof body.memoryContext === "string" ? body.memoryContext : "";
    const contextParts = [rapportContext, dynamicContext, profileSummary, memoryContext].filter(Boolean);
    const extraContext = contextParts.join("\n\n");
    const instructions = getLiveInterviewerInstructionsForRealtime(extraContext || undefined);

    const sessionConfig = {
      session: {
        type: "realtime" as const,
        model: "gpt-realtime",
        instructions,
        input_audio_transcription: { model: "whisper-1" },
        turn_detection: { type: "server_vad" as const, threshold: 0.5, prefix_padding_ms: 300, silence_duration_ms: 500 },
        audio: {
          output: { voice: REALTIME_VOICE },
        },
      },
    };

    const res = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sessionConfig),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("OpenAI Realtime client_secrets error:", res.status, errText);
      return NextResponse.json(
        { error: "Failed to create Realtime session", details: errText },
        { status: 502 }
      );
    }

    const data = (await res.json()) as { value?: string };
    const clientSecret = data?.value;
    if (!clientSecret) {
      return NextResponse.json(
        { error: "No client secret in Realtime response" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      clientSecret,
      model: sessionConfig.session.model,
      voice: REALTIME_VOICE,
    });
  } catch (err) {
    console.error("Live session create error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create live session" },
      { status: 500 }
    );
  }
}
