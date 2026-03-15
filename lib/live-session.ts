/**
 * Sector 4: Live interview session state and mode.
 * Used for hybrid flow: opening (S2S) -> cascaded -> live trigger -> S2S -> closing (S2S).
 */

export type LiveMode = "opening" | "cascaded" | "s2s" | "closing";

export type LiveConversationMessage = { role: "user" | "assistant"; content: string };

/**
 * Conversation buffer for session/complete. Append from Realtime events or cascaded turns.
 */
export function appendToConversation(
  buffer: LiveConversationMessage[],
  role: "user" | "assistant",
  content: string
): LiveConversationMessage[] {
  const trimmed = content?.trim();
  if (!trimmed) return buffer;
  return [...buffer, { role, content: trimmed }];
}

/**
 * Heuristic: does the transcript look like the user is asking a question (live moment)?
 */
export function looksLikeQuestion(transcript: string): boolean {
  const t = transcript.trim().toLowerCase();
  if (t.length < 10) return false;
  const questionStart =
    t.startsWith("can you") ||
    t.startsWith("could you") ||
    t.startsWith("what ") ||
    t.startsWith("how ") ||
    t.startsWith("why ") ||
    t.startsWith("when ") ||
    t.startsWith("where ") ||
    t.endsWith("?");
  return questionStart;
}

/**
 * Whether we should use S2S for this segment (opening, closing, or after a live trigger).
 */
export function shouldUseS2S(mode: LiveMode): boolean {
  return mode === "opening" || mode === "s2s" || mode === "closing";
}
