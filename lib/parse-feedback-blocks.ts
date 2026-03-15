/**
 * Parses assistant messages that use FEEDBACK_START/END, FOLLOWUP_START/END, OPTIMIZED_START/END
 * so the UI can render three distinct sections (feedback, follow-up questions, optimized answer).
 */

export type StructuredFeedback = {
  feedback: string;
  followUp: string;
  optimized: string;
};

export function parseStructuredFeedback(content: string): StructuredFeedback | null {
  const feedbackMatch = content.match(/FEEDBACK_START\s*([\s\S]*?)FEEDBACK_END/);
  const followUpMatch = content.match(/FOLLOWUP_START\s*([\s\S]*?)FOLLOWUP_END/);
  const optimizedMatch = content.match(/OPTIMIZED_START\s*([\s\S]*?)OPTIMIZED_END/);
  if (!feedbackMatch || !followUpMatch || !optimizedMatch) return null;
  return {
    feedback: feedbackMatch[1].trim(),
    followUp: followUpMatch[1].trim(),
    optimized: optimizedMatch[1].trim(),
  };
}

/** Strip delimiter blocks from content for fallback display (e.g. TTS or plain bubble). */
export function stripStructuredDelimiters(content: string): string {
  return content
    .replace(/\s*FEEDBACK_START\s*[\s\S]*?FEEDBACK_END\s*/g, "")
    .replace(/\s*FOLLOWUP_START\s*[\s\S]*?FOLLOWUP_END\s*/g, "")
    .replace(/\s*OPTIMIZED_START\s*[\s\S]*?OPTIMIZED_END\s*/g, "")
    .trim();
}
