const STORAGE_KEY = "aptitude_profile";

export type Profile = {
  name?: string;
  major?: string;
  year?: string;
  targetRole?: string;
  firstGen?: boolean;
  careerGoals?: string;
  /** What the user wants to improve in interviews (from pre-interview questionnaire) */
  improveArea?: string;
  /** Field or area of interest (e.g. business analysis, consulting). Used so the coach tailors examples. */
  fieldOfInterest?: string;
};

const ONBOARDING_COMPLETE_KEY = "aptitude_onboarding_complete";

/** True if user has filled at least target role, improve area, or field of interest (used to show or skip pre-interview questionnaire). */
export function hasMinimalProfile(profile: Profile): boolean {
  return !!(profile.targetRole?.trim() || profile.improveArea?.trim() || profile.fieldOfInterest?.trim());
}

/** Mark that the user has completed or skipped the pre-interview questionnaire. */
export function setOnboardingComplete(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ONBOARDING_COMPLETE_KEY, "1");
  } catch {
    // ignore
  }
}

/** True if the user has already completed or skipped the questionnaire this visit/session. */
export function isOnboardingComplete(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(ONBOARDING_COMPLETE_KEY) === "1";
  } catch {
    return false;
  }
}

export function getProfile(): Profile {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Profile;
  } catch {
    return {};
  }
}

export function setProfile(profile: Profile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // ignore
  }
}

/** One-line summary for injection into system prompt */
export function getProfileSummary(profile: Profile): string {
  const parts: string[] = [];
  if (profile.name) parts.push(`Name: ${profile.name}`);
  if (profile.major) parts.push(`Major: ${profile.major}`);
  if (profile.year) parts.push(`Year: ${profile.year}`);
  if (profile.targetRole) parts.push(`Target role: ${profile.targetRole}`);
  if (profile.firstGen !== undefined) parts.push(`First-gen: ${profile.firstGen ? "yes" : "no"}`);
  if (profile.careerGoals) parts.push(`Career goals: ${profile.careerGoals}`);
  if (profile.improveArea) parts.push(`Wants to improve in interviews: ${profile.improveArea}`);
  if (profile.fieldOfInterest) parts.push(`Field of interest: ${profile.fieldOfInterest} (use this for examples and role context; do not assume consulting if they said e.g. business analysis)`);
  if (parts.length === 0) return "";
  return "Candidate profile: " + parts.join(". ");
}
