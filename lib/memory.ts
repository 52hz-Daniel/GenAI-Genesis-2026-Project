const STORAGE_KEY = "aptitude_session_notes";

export type SessionNote = {
  id: string;
  createdAt: number;
  content: string;
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

export function addSessionNote(content: string): void {
  if (typeof window === "undefined") return;
  const notes = getSessionNotes();
  const note: SessionNote = {
    id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    createdAt: Date.now(),
    content,
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
  const excerpt = last.content.slice(0, 1500);
  return `Previous session note (use to reference past feedback and consider re-testing on weaknesses):\n${excerpt}`;
}
