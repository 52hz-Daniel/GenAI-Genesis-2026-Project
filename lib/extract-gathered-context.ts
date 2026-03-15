import { getOpenAIClient } from "./openai";

/**
 * Suggested keys for context_json. Not exhaustive; extraction can add others.
 */
export type GatheredContextJson = {
  topic?: string;
  role_type?: string;
  interest?: string;
  goal_for_session?: string;
  background_snippet?: string;
  [key: string]: string | undefined;
};

const EXTRACTION_SYSTEM = `From this short exchange where the interviewer asked context questions and the candidate answered, extract structured facts.

Output a JSON object with short string values only. Use only these keys when you can infer a value: topic, role_type, interest, goal_for_session, background_snippet. Include only keys you can infer from the exchange. You may add other short keys if relevant. No preamble, no markdown, only the JSON object.`;

/**
 * Extract structured context from a warm-up exchange (user ready, assistant warm-up Qs, user answer).
 * Returns an object suitable for context_json in user_gathered_context.
 */
export async function extractGatheredContext(
  transcript: string,
  _sessionFocus?: string
): Promise<GatheredContextJson> {
  const openai = getOpenAIClient();
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: EXTRACTION_SYSTEM },
      { role: "user", content: `Exchange:\n\n${transcript.slice(0, 4000)}` },
    ],
    temperature: 0.2,
  });
  const content = completion.choices[0]?.message?.content?.trim() ?? "";
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return {};
  try {
    const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
    const result: GatheredContextJson = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (typeof v === "string" && v.trim().length > 0) {
        result[k] = v.trim().slice(0, 500);
      }
    }
    return result;
  } catch {
    return {};
  }
}
