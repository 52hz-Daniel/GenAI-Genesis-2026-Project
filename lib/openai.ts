import OpenAI from "openai";

export function getOpenAIClient(): OpenAI {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error("OPENAI_API_KEY is not set");
  }
  return new OpenAI({ apiKey: key });
}

export async function getResumeBullets(rawInput: string): Promise<string[]> {
  const openai = getOpenAIClient();
  const { RESUME_SYSTEM_PROMPT, buildResumeUserPrompt } = await import("./prompts");
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: RESUME_SYSTEM_PROMPT },
      { role: "user", content: buildResumeUserPrompt(rawInput) },
    ],
    temperature: 0.7,
  });
  const content = completion.choices[0]?.message?.content?.trim() ?? "";
  const lines = content
    .split("\n")
    .map((s) => s.replace(/^\d+\.\s*/, "").trim())
    .filter((s) => s.length > 0);
  return lines.slice(0, 3);
}

export async function getInterviewReply(
  history: { role: "user" | "assistant"; content: string }[],
  context?: string
): Promise<string> {
  const openai = getOpenAIClient();
  const { buildInterviewMessages } = await import("./prompts");
  const messages = buildInterviewMessages(history, context);
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    temperature: 0.8,
  });
  return completion.choices[0]?.message?.content?.trim() ?? "";
}
