const STORAGE_KEY = "aptitude_profile";

export type Profile = {
  name?: string;
  major?: string;
  year?: string;
  targetRole?: string;
  firstGen?: boolean;
  careerGoals?: string;
};

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
  if (parts.length === 0) return "";
  return "Candidate profile: " + parts.join(". ");
}
