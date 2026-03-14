"use client";

import { useState, useEffect } from "react";
import { getProfile, setProfile, type Profile } from "@/lib/profile";

export default function ProfilePage() {
  const [profile, setProfileState] = useState<Profile>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setProfileState(getProfile());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile(profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="text-2xl font-bold text-foreground mb-2">Your profile</h1>
      <p className="text-muted mb-6">
        This info is used to tailor interview questions and feedback. Stored only on this device unless you sign in and we add cloud sync later.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Name</label>
          <input
            type="text"
            value={profile.name ?? ""}
            onChange={(e) => setProfileState((p) => ({ ...p, name: e.target.value }))}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="e.g. Alex"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Major / program</label>
          <input
            type="text"
            value={profile.major ?? ""}
            onChange={(e) => setProfileState((p) => ({ ...p, major: e.target.value }))}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="e.g. Computer Science"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Year</label>
          <input
            type="text"
            value={profile.year ?? ""}
            onChange={(e) => setProfileState((p) => ({ ...p, year: e.target.value }))}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="e.g. Junior"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Target role</label>
          <input
            type="text"
            value={profile.targetRole ?? ""}
            onChange={(e) => setProfileState((p) => ({ ...p, targetRole: e.target.value }))}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="e.g. Product manager intern"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="firstGen"
            checked={profile.firstGen ?? false}
            onChange={(e) => setProfileState((p) => ({ ...p, firstGen: e.target.checked }))}
            className="rounded border-border"
          />
          <label htmlFor="firstGen" className="text-sm text-foreground">First-generation student</label>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Career goals (optional)</label>
          <textarea
            value={profile.careerGoals ?? ""}
            onChange={(e) => setProfileState((p) => ({ ...p, careerGoals: e.target.value }))}
            rows={3}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent resize-y"
            placeholder="e.g. Get an internship in tech, then pursue product management"
          />
        </div>
        <button
          type="submit"
          className="rounded-xl bg-accent text-white px-6 py-3 font-medium hover:bg-accent/90 transition-colors"
        >
          Save profile
        </button>
        {saved && <span className="ml-3 text-sm text-green-600">Saved.</span>}
      </form>
    </div>
  );
}
