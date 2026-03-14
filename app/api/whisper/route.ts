import { NextRequest, NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/openai";

export async function POST(request: NextRequest) {
  try {
    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      return NextResponse.json({ error: "OPENAI_API_KEY is not set" }, { status: 500 });
    }
    const formData = await request.formData();
    const file = formData.get("file") ?? formData.get("audio");
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "Missing audio file (field: file or audio)" }, { status: 400 });
    }
    const openai = getOpenAIClient();
    const transcription = await openai.audio.transcriptions.create({
      file: new File([file], "audio.webm", { type: file.type || "audio/webm" }),
      model: "whisper-1",
    });
    const text = transcription.text?.trim() ?? "";
    return NextResponse.json({ text });
  } catch (err) {
    console.error("Whisper API error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Transcription failed" },
      { status: 500 }
    );
  }
}
