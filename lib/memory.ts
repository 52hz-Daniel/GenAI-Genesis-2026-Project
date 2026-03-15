const STORAGE_KEY = "aptitude_session_notes";

export type SessionNote = {
  id: string;
  createdAt: number;
  /** User-facing feedback (professional tutor style). Shown on Progress page. */
  content: string;
  /** Internal summary for AI long-term memory. Used by getMemoryForPrompt. */
  internalSummary?: string;
};

export function getSessionNotes(): SessionNote[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SessionNote[];
  } catch {
    return [];
  }
}

/**
 * Add a session note. Use userFeedback for what the user sees; use internalSummary for AI memory.
 * If only one string is passed, it is used for both.
 */
export function addSessionNote(markdownOrUserFeedback: string, userFeedback?: string): void {
  if (typeof window === "undefined") return;
  const notes = getSessionNotes();
  const displayContent = userFeedback ?? markdownOrUserFeedback;
  const internalSummary = userFeedback != null ? markdownOrUserFeedback : undefined;
  const note: SessionNote = {
    id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    createdAt: Date.now(),
    content: displayContent,
    ...(internalSummary ? { internalSummary } : {}),
  };
  notes.unshift(note);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes.slice(0, 50)));
  } catch {
    // ignore
  }
}

/** Text to inject into system prompt: last session summary + areas to improve for re-test */
export function getMemoryForPrompt(): string {
  const notes = getSessionNotes();
  if (notes.length === 0) return "";
  const last = notes[0];
  const source = last.internalSummary ?? last.content;
  const excerpt = source.slice(0, 1500);
  return `Previous session note (use to reference past feedback and consider re-testing on weaknesses):\n${excerpt}`;
}
