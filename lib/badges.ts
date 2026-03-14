export const BADGE_KEY = "aptitude_badge_unlocked";

export function setInterviewBadgeUnlocked(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(BADGE_KEY, "true");
  } catch {
    // ignore
  }
}

export function hasInterviewBadgeUnlocked(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(BADGE_KEY) === "true";
  } catch {
    return false;
  }
}

export const INTERVIEW_BADGE_ID = "communication";
export const INTERVIEW_BADGE_TITLE = "Communication";
export const INTERVIEW_BADGE_DESCRIPTION = "Completed behavioral interview practice with supportive AI feedback.";
