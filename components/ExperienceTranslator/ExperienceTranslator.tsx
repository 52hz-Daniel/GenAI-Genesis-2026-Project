"use client";

import { useState, useRef, useCallback } from "react";
import { ThreeBulletsSkeleton } from "@/components/ui/Skeleton";
import { useToast, Toast } from "@/components/ui/Toast";
import { logEvent } from "@/lib/analytics";
import { TRANSLATE_EXAMPLES } from "@/lib/demo-examples";

export function ExperienceTranslator() {
  const [input, setInput] = useState("");
  const [bullets, setBullets] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { message, show: showToast, clear: clearToast } = useToast();
  const timerStarted = useRef(false);
  const timerStartRef = useRef<number | null>(null);

  const startTimerOnce = useCallback(() => {
    if (timerStarted.current) return;
    timerStarted.current = true;
    timerStartRef.current = Date.now();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) {
      setError("Add something first. Even a sentence helps.");
      return;
    }
    setError(null);
    setBullets(null);
    setLoading(true);
    startTimerOnce();
    try {
      const res = await fetch("/api/openai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "resume", input: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      const list = Array.isArray(data.bullets) ? data.bullets : [];
      setBullets(list);
      const elapsed = timerStartRef.current != null ? Math.round((Date.now() - timerStartRef.current) / 1000) : 0;
      logEvent("time_to_first_resume_bullet", { seconds: elapsed });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyBullet = (text: string) => {
    navigator.clipboard.writeText(text).then(() => showToast("Copied!"));
  };

  const copyAll = () => {
    if (!bullets?.length) return;
    navigator.clipboard.writeText(bullets.join("\n")).then(() => showToast("All three copied!"));
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <label htmlFor="experience-input" className="block text-sm font-medium text-foreground">
          What did you do in class this week?
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted">Quick demo for judges:</span>
          {TRANSLATE_EXAMPLES.map((ex) => (
            <button
              key={ex.label}
              type="button"
              onClick={() => setInput(ex.text)}
              className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted-bg transition-colors"
            >
              {ex.label}
            </button>
          ))}
        </div>
        <textarea
          id="experience-input"
          onFocus={startTimerOnce}
          onInput={() => { setInput((v) => v); startTimerOnce(); }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste or type anything: a project, a presentation, group work..."
          className="w-full min-h-[140px] rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-y transition-shadow"
          disabled={loading}
        />
        {error && (
          <p className="text-sm text-red-500 dark:text-red-400" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-accent text-white font-medium hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Translating…" : "Get 3 resume bullets"}
        </button>
      </form>

      {loading && (
        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm text-muted mb-4">Here are three ways to say it:</p>
          <ThreeBulletsSkeleton />
        </div>
      )}

      {!loading && bullets && bullets.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-6 space-y-4 animate-[fadeIn_0.3s_ease-out]">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-sm font-medium text-success">Nice work! Here are three ways to say it:</p>
            <button
              type="button"
              onClick={copyAll}
              className="text-sm text-accent hover:underline"
            >
              Copy all three
            </button>
          </div>
          <ul className="space-y-4">
            {bullets.map((bullet, i) => (
              <li key={i} className="flex gap-3 items-start">
                <span className="flex-1 text-foreground">{bullet}</span>
                <button
                  type="button"
                  onClick={() => copyBullet(bullet)}
                  className="shrink-0 rounded-md px-3 py-1.5 text-sm border border-border hover:bg-muted-bg transition-colors"
                  aria-label={`Copy bullet ${i + 1}`}
                >
                  Copy
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Toast message={message} onDismiss={clearToast} />
    </div>
  );
}
