"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { logEvent } from "@/lib/analytics";
import { setInterviewBadgeUnlocked } from "@/lib/badges";
import { INTERVIEW_ANSWER_EXAMPLES } from "@/lib/demo-examples";
import { getProfile, getProfileSummary, hasMinimalProfile, setProfile, setOnboardingComplete, isOnboardingComplete, type Profile } from "@/lib/profile";
import { addSessionNote, getMemoryForPrompt } from "@/lib/memory";
import { parseStructuredFeedback, stripStructuredDelimiters } from "@/lib/parse-feedback-blocks";

const TOTAL_QUESTIONS = 3;

type Message = { role: "user" | "assistant"; content: string };

export function MockInterview() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [voiceOn, setVoiceOn] = useState(false);
  const [jdText, setJdText] = useState("");
  const [interviewContext, setInterviewContext] = useState<string>("");
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [questionnaireForm, setQuestionnaireForm] = useState<Partial<Profile>>({});
  const [sessionFocusLabel, setSessionFocusLabel] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<Message[]>([]);
  const lastPlayedAssistantIndexRef = useRef(-1);
  const interviewContextRef = useRef(interviewContext);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);
  useEffect(() => {
    interviewContextRef.current = interviewContext;
  }, [interviewContext]);

  useEffect(() => {
    const profile = getProfile();
    if (!hasMinimalProfile(profile) && !isOnboardingComplete()) {
      setShowQuestionnaire(true);
      setQuestionnaireForm({
        targetRole: profile.targetRole ?? "",
        year: profile.year ?? "",
        major: profile.major ?? "",
        improveArea: profile.improveArea ?? "",
        firstGen: profile.firstGen,
      });
    }
  }, []);

  useEffect(() => {
    if (!voiceOn || messages.length === 0) return;
    const last = messages[messages.length - 1];
    if (last.role !== "assistant" || lastPlayedAssistantIndexRef.current === messages.length - 1) return;
    lastPlayedAssistantIndexRef.current = messages.length - 1;
    const raw = last.content.replace(/BADGE_UNLOCKED/g, "").trim();
    const structured = parseStructuredFeedback(last.content);
    const toSpeak = structured
      ? `${structured.feedback} ${structured.followUp}`.trim()
      : raw;
    if (!toSpeak) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: toSpeak }),
        });
        if (!res.ok || cancelled) return;
        const blob = await res.blob();
        if (cancelled) return;
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.onended = () => URL.revokeObjectURL(url);
        audio.onerror = () => URL.revokeObjectURL(url);
        await audio.play();
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [voiceOn, messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (!started && messages.length === 0) return;
    if (!started) {
      setStarted(true);
      logEvent("interview_started");
    }
  }, [started, messages.length]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setInput("");
    const userMessage: Message = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    const history = [...messagesRef.current, userMessage];
    const step = history.filter((m) => m.role === "user").length;
    logEvent("interview_step", { step });
    try {
      let dynamicContext = "";
      if (session?.user) {
        try {
          const dcRes = await fetch("/api/context/dynamic");
          const dcData = await dcRes.json();
          if (dcData?.context) dynamicContext = dcData.context;
          if (typeof dcData?.sessionFocusLabel === "string") {
            setSessionFocusLabel(dcData.sessionFocusLabel);
          }
        } catch {
          // ignore
        }
      }
      const profileSummary = getProfileSummary(getProfile());
      const jdContext = interviewContextRef.current?.trim();
      const memoryContext = getMemoryForPrompt();
      const context = [dynamicContext, memoryContext, profileSummary, jdContext].filter(Boolean).join("\n\n") || undefined;

      const phase =
        history.length === 1
          ? "warmup"
          : history.length === 3 && history[2].role === "user"
            ? "post_warmup"
            : undefined;

      const res = await fetch("/api/openai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "interview", history, context, phase }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      const reply = data.reply ?? "";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);

      if (phase === "post_warmup" && session?.user) {
        try {
          const sessionFocusMatch = dynamicContext.match(/This session focus:\s*([^.]+)/);
          const sessionFocus = sessionFocusMatch
            ? sessionFocusMatch[1].trim().slice(0, 100)
            : undefined;
          await fetch("/api/context/gather", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              messages: history.slice(0, 3),
              sessionFocus,
            }),
          });
        } catch {
          // fire-and-forget
        }
      }

      if (reply.includes("BADGE_UNLOCKED")) {
        setInterviewBadgeUnlocked();
        setCompleted(true);
        logEvent("interview_completed");
        const fullHistory = [...history, { role: "assistant" as const, content: reply }];
        if (session?.user) {
          try {
            await fetch("/api/session/complete", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ messages: fullHistory }),
            });
          } catch {
            // ignore
          }
        }
        try {
          const res = await fetch("/api/session-notes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages: fullHistory }),
          });
          const data = await res.json();
          if (res.ok && data.markdown) addSessionNote(data.markdown);
        } catch {
          // ignore
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Something went wrong. You can try again or refresh the page.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start(200);
      mediaRecorderRef.current = recorder;
      setRecording(true);
    } catch {
      setRecording(false);
    }
  }, []);

  const stopRecordingAndSend = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") {
      setRecording(false);
      return;
    }
    recorder.onstop = async () => {
      mediaRecorderRef.current = null;
      setRecording(false);
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      chunksRef.current = [];
      if (blob.size < 500) return;
      setTranscribing(true);
      try {
        const form = new FormData();
        form.append("file", blob, "answer.webm");
        const res = await fetch("/api/whisper", { method: "POST", body: form });
        const data = await res.json();
        const text = data.text?.trim();
        if (text) sendMessage(text);
        else sendMessage("[No speech detected. Try again or type your answer.]");
      } catch {
        sendMessage("[Voice transcription failed. You can type your answer below.]");
      } finally {
        setTranscribing(false);
      }
    };
    recorder.stop();
  // sendMessage intentionally omitted: we use messagesRef for latest history in async callback
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      stopRecordingAndSend();
    } else {
      setRecording(false);
    }
  }, [stopRecordingAndSend]);

  const userQuestionCount = messages.filter((m) => m.role === "user").length;
  const progress = Math.min(userQuestionCount, TOTAL_QUESTIONS);
  const lastMessageFromAssistant = messages.length > 0 && messages[messages.length - 1].role === "assistant";
  const currentExampleIndex = userQuestionCount - 1;
  const showDemoExample = !completed && !loading && lastMessageFromAssistant && currentExampleIndex >= 0 && currentExampleIndex < TOTAL_QUESTIONS;
  const currentExampleText = showDemoExample ? INTERVIEW_ANSWER_EXAMPLES[currentExampleIndex] : "";

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] max-h-[700px]">
      <div className="flex items-center justify-between px-1 pb-2 gap-3">
        <span className="text-sm text-muted">
          Question {progress} of {TOTAL_QUESTIONS}
        </span>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={voiceOn}
            onChange={(e) => setVoiceOn(e.target.checked)}
            className="rounded border-border"
          />
          <span className="text-sm text-muted">Voice on</span>
        </label>
        <div className="flex-1 max-w-[120px] sm:max-w-[180px] h-1.5 rounded-full bg-muted-bg overflow-hidden">
          <div
            className="h-full rounded-full bg-accent transition-all duration-300"
            style={{ width: `${(progress / TOTAL_QUESTIONS) * 100}%` }}
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto rounded-xl border border-border bg-card flex flex-col">
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          {sessionFocusLabel && messages.length > 0 && (
            <p className="text-xs text-muted border-b border-border pb-2 mb-1">
              This session: focusing on <span className="font-medium text-foreground">{sessionFocusLabel}</span>
            </p>
          )}
          {messages.length === 0 && !loading && (
            <p className="text-muted text-sm">
              Click &quot;Start practice&quot; to begin. The AI will greet you and ask the first question.
            </p>
          )}
          {messages.map((m, i) => {
            if (m.role === "user") {
              return (
                <div key={i} className="flex justify-end">
                  <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 bg-accent text-white rounded-br-md">
                    <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                  </div>
                </div>
              );
            }
            const structured = parseStructuredFeedback(m.content);
            const displayText = stripStructuredDelimiters(m.content).replace(/BADGE_UNLOCKED/g, "").trim();
            if (structured) {
              return (
                <div key={i} className="flex justify-start">
                  <div className="max-w-[85%] sm:max-w-[75%] w-full space-y-2">
                    <div className="rounded-2xl rounded-bl-md bg-muted-bg text-foreground px-4 py-2.5 border border-border">
                      <p className="text-xs font-medium text-muted mb-1">Feedback</p>
                      <p className="text-sm whitespace-pre-wrap">{structured.feedback}</p>
                    </div>
                    <div className="rounded-2xl rounded-bl-md bg-muted-bg text-foreground px-4 py-2.5 border border-border">
                      <p className="text-xs font-medium text-muted mb-1">Follow-up questions</p>
                      <p className="text-sm whitespace-pre-wrap">{structured.followUp}</p>
                    </div>
                    <div className="rounded-2xl rounded-bl-md bg-muted-bg text-foreground px-4 py-2.5 border border-border">
                      <p className="text-xs font-medium text-muted mb-1">Optimized answer</p>
                      <p className="text-sm whitespace-pre-wrap">{structured.optimized}</p>
                    </div>
                  </div>
                </div>
              );
            }
            return (
              <div key={i} className="flex justify-start">
                <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl rounded-bl-md bg-muted-bg text-foreground px-4 py-2.5">
                  <p className="text-sm whitespace-pre-wrap">{displayText}</p>
                </div>
              </div>
            );
          })}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-md bg-muted-bg px-4 py-2.5">
                <span className="text-sm text-muted flex items-center gap-2">
                  <span className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-muted animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-muted animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-muted animate-bounce" style={{ animationDelay: "300ms" }} />
                  </span>
                  Interviewer is typing…
                </span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {completed ? (
          <div className="p-4 border-t border-border bg-success-soft/30 animate-[fadeIn_0.4s_ease-out]">
            <p className="text-sm text-foreground font-medium mb-2">You did it!</p>
            <p className="text-sm text-muted mb-3">
              You&apos;ve unlocked a badge. Check your Badges page to copy or share it.
            </p>
            <Link
              href="/badges"
              className="inline-flex items-center rounded-lg bg-accent text-white px-4 py-2 text-sm font-medium hover:bg-accent/90"
            >
              View my badge
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 border-t border-border space-y-2">
            {showDemoExample && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted">Quick demo for judges:</span>
                <button
                  type="button"
                  onClick={() => setInput(currentExampleText)}
                  className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted-bg transition-colors"
                >
                  Use example answer for this question
                </button>
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your answer or record..."
                className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                disabled={loading || transcribing}
              />
              {recording ? (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="rounded-xl bg-red-500 text-white px-4 py-3 font-medium hover:bg-red-600 transition-colors"
                >
                  Done
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startRecording}
                  disabled={loading || transcribing}
                  className="rounded-xl border border-border bg-card px-4 py-3 font-medium text-foreground hover:bg-muted-bg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Record your answer"
                >
                  🎤
                </button>
              )}
              <button
                type="submit"
                disabled={loading || transcribing || !input.trim()}
                className="rounded-xl bg-accent text-white px-4 py-3 font-medium hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Send
              </button>
            </div>
            {transcribing && (
              <p className="text-xs text-muted">Transcribing your answer…</p>
            )}
          </form>
        )}
      </div>

      {messages.length === 0 && !loading && showQuestionnaire && (
        <div className="mt-4 space-y-3 p-4 rounded-xl border border-border bg-card">
          <p className="text-sm font-medium text-foreground mb-3">
            Quick profile (so we can tailor your practice)
          </p>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-muted mb-1">Target role or industry</label>
              <input
                type="text"
                value={questionnaireForm.targetRole ?? ""}
                onChange={(e) => setQuestionnaireForm((p) => ({ ...p, targetRole: e.target.value }))}
                placeholder="e.g. Consulting, Product Manager"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-muted mb-1">Year</label>
                <input
                  type="text"
                  value={questionnaireForm.year ?? ""}
                  onChange={(e) => setQuestionnaireForm((p) => ({ ...p, year: e.target.value }))}
                  placeholder="e.g. Junior, 2026"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1">Major</label>
                <input
                  type="text"
                  value={questionnaireForm.major ?? ""}
                  onChange={(e) => setQuestionnaireForm((p) => ({ ...p, major: e.target.value }))}
                  placeholder="Optional"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">What do you want to improve in interviews?</label>
              <input
                type="text"
                value={questionnaireForm.improveArea ?? ""}
                onChange={(e) => setQuestionnaireForm((p) => ({ ...p, improveArea: e.target.value }))}
                placeholder="e.g. Quantifying results, STAR structure"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={questionnaireForm.firstGen ?? false}
                onChange={(e) => setQuestionnaireForm((p) => ({ ...p, firstGen: e.target.checked }))}
                className="rounded border-border"
              />
              <span className="text-sm text-muted">First-gen student</span>
            </label>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setProfile({
                  ...getProfile(),
                  ...questionnaireForm,
                  targetRole: questionnaireForm.targetRole?.trim() || undefined,
                  year: questionnaireForm.year?.trim() || undefined,
                  major: questionnaireForm.major?.trim() || undefined,
                  improveArea: questionnaireForm.improveArea?.trim() || undefined,
                  firstGen: questionnaireForm.firstGen,
                });
                setOnboardingComplete();
                setShowQuestionnaire(false);
              }}
              className="rounded-xl bg-accent text-white px-4 py-2 text-sm font-medium hover:bg-accent/90"
            >
              Continue
            </button>
            <button
              type="button"
              onClick={() => {
                setOnboardingComplete();
                setShowQuestionnaire(false);
              }}
              className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted-bg"
            >
              Skip
            </button>
          </div>
        </div>
      )}
      {messages.length === 0 && !loading && !showQuestionnaire && (
        <div className="mt-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Optional: paste a job description to tailor questions
            </label>
            <textarea
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder="Paste the job description here..."
              rows={4}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-y"
            />
          </div>
          <button
            type="button"
            onClick={async () => {
              const trimmedJd = jdText.trim();
              if (trimmedJd) {
                try {
                  const res = await fetch("/api/jd-summarize", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ jd: trimmedJd }),
                  });
                  const data = await res.json();
                  if (res.ok && data.summary) {
                    setInterviewContext(data.summary);
                    interviewContextRef.current = data.summary;
                  }
                } catch {
                  // continue without context
                }
              }
              sendMessage("Hi, I'm ready to practice. Please start with a short intro and your first behavioral question.");
            }}
            className="w-full rounded-xl bg-accent text-white py-3 font-medium hover:bg-accent/90 transition-colors"
          >
            Start practice
          </button>
        </div>
      )}
    </div>
  );
}
