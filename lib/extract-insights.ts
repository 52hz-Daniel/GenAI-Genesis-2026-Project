import { getOpenAIClient } from "./openai";

export type ExtractedInsight = {
  competency_name: string;
  insight_type: "weakness" | "strength" | "hidden_spark";
  score: number;
  evidence_quote: string;
  socratic_feedback_given: string;
};

const EXTRACTION_SYSTEM = `You are analyzing a mock behavioral interview transcript. Extract structured insights for coaching.

Output a JSON array of objects. Each object must have exactly:
- competency_name: string (one of: Communication, STAR Method Structuring, Leadership, Teamwork, Conflict Resolution, Problem Solving, Adaptability, Quantifying Impact, Passive Language Avoidance)
- insight_type: "weakness" | "strength" | "hidden_spark"
- score: number 1-5 (1=needs work, 5=excellent)
- evidence_quote: string (short exact quote from the transcript)
- socratic_feedback_given: string (what the interviewer said as feedback)

Identify 2-6 distinct insights. Include at least one weakness and one strength when present. "hidden_spark" is for a positive behavioral nuance the candidate might not have noticed.

Framework violations to detect and tag as weakness (map to the competencies above):
- Pyramid: Answer or conclusion not stated first; candidate gives a chronological story without a clear takeaway; long preamble before the main point. Map to "Communication" or "STAR Method Structuring" and set insight_type "weakness" with evidence_quote showing the rambling or missing conclusion.
- MECE: In strategy or problem solving answers, overlapping or incomplete lists (options or factors that are not mutually exclusive or collectively exhaustive); prioritization that is neither ordered nor complete. Map to "Problem Solving" or "Communication" as weakness with evidence_quote.
- STAR / Result: Action described but Result vague or unquantified; phrases like "successfully completed", "went well", "we improved efficiency" without any numbers or measurable impact. Map to "Quantifying Impact" or "STAR Method Structuring" as weakness with evidence_quote.

When the transcript contains rambling without a point, or unquantified success, ensure at least one such weakness is extracted so it can drive the next session's coaching focus.
Output only the JSON array, no other text.`;

export async function extractSessionInsights(transcript: string): Promise<ExtractedInsight[]> {
  const openai = getOpenAIClient();
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: EXTRACTION_SYSTEM },
      { role: "user", content: `Transcript:\n\n${transcript.slice(0, 12000)}` },
    ],
    temperature: 0.3,
  });
  const content = completion.choices[0]?.message?.content?.trim() ?? "";
  const jsonMatch = content.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return [];
  try {
    const arr = JSON.parse(jsonMatch[0]) as unknown[];
    return arr
      .filter(
        (x): x is ExtractedInsight =>
          typeof x === "object" &&
          x !== null &&
          typeof (x as ExtractedInsight).competency_name === "string" &&
          ["weakness", "strength", "hidden_spark"].includes((x as ExtractedInsight).insight_type) &&
          typeof (x as ExtractedInsight).score === "number" &&
          typeof (x as ExtractedInsight).evidence_quote === "string" &&
          typeof (x as ExtractedInsight).socratic_feedback_given === "string"
      )
      .map((x) => ({
        ...x,
        score: Math.min(5, Math.max(1, Math.round(x.score))),
      }));
  } catch {
    return [];
  }
}

export async function getEmbedding(text: string): Promise<number[]> {
  const openai = getOpenAIClient();
  const res = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text.slice(0, 8000),
  });
  const embedding = res.data[0]?.embedding;
  if (!embedding || !Array.isArray(embedding)) throw new Error("No embedding returned");
  return embedding;
}
