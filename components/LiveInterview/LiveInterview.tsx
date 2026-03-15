"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { getProfile, getProfileSummary } from "@/lib/profile";
import { getMemoryForPrompt } from "@/lib/memory";
import { isDemoJudgeMode } from "@/lib/demo-judge-client";
import { LiveInterviewTimer } from "./LiveInterviewTimer";

const REALTIME_CALLS_URL = "https://api.openai.com/v1/realtime/calls";

type Status = "idle" | "creating" | "connecting" | "connected" | "ended" | "error";

type LiveInterviewProps = { demoMode?: boolean };

export function LiveInterview({ demoMode }: LiveInterviewProps = {}) {
  const { data: session, status: authStatus } = useSession();
  const [demoJudgeActive, setDemoJudgeActive] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  useEffect(() => {
    setDemoJudgeActive(isDemoJudgeMode());
  }, []);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const userEndedRef = useRef(false);
  const conversationMessagesRef = useRef<{ role: "user" | "assistant"; content: string }[]>([]);

  const cleanup = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    pcRef.current?.close();
    pcRef.current = null;
    if (audioRef.current) {
      audioRef.current.srcObject = null;
    }
    setTimerRunning(false);
  }, []);

  const startSession = useCallback(async () => {
    const canStart = (authStatus === "authenticated" && session?.user?.email) || isDemoJudgeMode();
    if (!canStart) {
      setErrorMessage("Please sign in to start a live interview.");
      return;
    }

    setStatus("creating");
    setErrorMessage(null);
    conversationMessagesRef.current = [];
    userEndedRef.current = false;

    try {
      const profileSummary = getProfileSummary(getProfile());
      const memoryContext = getMemoryForPrompt();

      const res = await fetch("/api/live", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileSummary: profileSummary || undefined,
          memoryContext: memoryContext || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        const msg = data?.details
          ? `${data.error ?? "Failed to create session"}: ${data.details}`
          : (data?.error || "Failed to create session");
        throw new Error(msg);
      }

      const clientSecret = data.clientSecret as string;
      if (!clientSecret) {
        throw new Error("No client secret returned");
      }

      setStatus("connecting");

      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      const audioEl = document.createElement("audio");
      audioEl.autoplay = true;
      audioRef.current = audioEl;
      pc.ontrack = (e) => {
        if (audioEl.srcObject !== e.streams[0]) {
          audioEl.srcObject = e.streams[0];
        }
      };

      const ms = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = ms;
      pc.addTrack(ms.getTracks()[0]);

      const dc = pc.createDataChannel("oai-events");
      dc.onmessage = (e) => {
        try {
          const ev = JSON.parse(e.data);
          const type = ev?.type;
          const item = ev?.item;
          if (type === "conversation.item.added" && item) {
            const role = item.role === "user" ? "user" : item.role === "assistant" ? "assistant" : null;
            if (role && Array.isArray(item.content)) {
              const text = item.content
                .filter((c: { type?: string; text?: string }) => c?.type === "input_text" || c?.type === "output_text" || c?.type === "text")
                .map((c: { text?: string }) => c?.text ?? "")
                .join("")
                .trim();
              if (text) {
                conversationMessagesRef.current = [...conversationMessagesRef.current, { role, content: text }];
              }
            }
          }
          if (type === "response.output_audio_transcript.done" && ev?.transcript) {
            const text = String(ev.transcript).trim();
            if (text) {
              conversationMessagesRef.current = [...conversationMessagesRef.current, { role: "assistant", content: text }];
            }
          }
        } catch {
          // ignore parse errors
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const sdpRes = await fetch(REALTIME_CALLS_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${clientSecret}`,
          "Content-Type": "application/sdp",
        },
        body: offer.sdp ?? "",
      });

      if (!sdpRes.ok) {
        const errText = await sdpRes.text();
        throw new Error(`Realtime connection failed: ${sdpRes.status} ${errText}`);
      }

      const answerSdp = await sdpRes.text();
      await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "connected") {
          setStatus("connected");
          setTimerRunning(true);
        } else if (pc.connectionState === "failed" || pc.connectionState === "disconnected" || pc.connectionState === "closed") {
          if (!userEndedRef.current) {
            setStatus("error");
            setErrorMessage("Connection lost.");
          }
          cleanup();
        }
      };

      if (pc.connectionState === "connected") {
        setStatus("connected");
        setTimerRunning(true);
      }
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong");
      cleanup();
    }
  }, [authStatus, session?.user?.email, cleanup]);

  const endSession = useCallback(async () => {
    userEndedRef.current = true;
    const messages = conversationMessagesRef.current;
    setStatus("ended");
    cleanup();
    if (messages.length > 0) {
      try {
        await fetch("/api/session/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages }),
        });
      } catch {
        // best effort
      }
    }
    conversationMessagesRef.current = [];
  }, [cleanup]);

  const handleTimerExpire = useCallback(() => {
    endSession();
  }, [endSession]);

  if (authStatus === "loading") {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-center text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (authStatus !== "authenticated" && !demoJudgeActive) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-center">
        <p className="text-foreground mb-4">
          {demoMode ? "Sign in to start a 5-minute demo." : "Sign in to start a 30-minute live voice interview."}
        </p>
        <Link href="/auth/signin" className="text-primary underline">
          Sign in
        </Link>
      </div>
    );
  }

  if (status === "ended") {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <p className="text-foreground font-medium mb-2">Session ended</p>
        <p className="text-muted text-sm mb-4">Your live interview has been saved.</p>
        <Link href="/progress" className="text-primary underline text-sm">
          View progress
        </Link>
        <span className="mx-2 text-muted">|</span>
        <Link href="/interview" className="text-primary underline text-sm">
          Back to practice
        </Link>
      </div>
    );
  }

  if (status === "error") {
    const isRealtimeFail = errorMessage?.includes("Realtime") || errorMessage?.includes("502");
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <p className="text-destructive font-medium mb-2">Error</p>
        <p className="text-muted text-sm mb-2 break-words">{errorMessage}</p>
        {isRealtimeFail && (
          <p className="text-muted text-xs mb-4">
            On Vercel: set <code className="bg-muted px-1 rounded">OPENAI_API_KEY</code> in Production env. Realtime requires API access.
          </p>
        )}
        <button
          type="button"
          onClick={() => { setStatus("idle"); setErrorMessage(null); }}
          className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
        <LiveInterviewTimer
          running={timerRunning}
          onExpire={handleTimerExpire}
          totalSeconds={demoMode ? 5 * 60 : undefined}
        />
        <div className="flex items-center gap-2">
          {status === "connected" && (
            <span className="text-xs font-medium text-green-600 dark:text-green-400">Live</span>
          )}
          {status === "connected" && (
            <button
              type="button"
              onClick={endSession}
              className="rounded-lg bg-destructive/90 px-4 py-2 text-sm font-medium text-white hover:bg-destructive transition-colors"
            >
              End interview
            </button>
          )}
        </div>
      </div>

      {status === "idle" && (
        <div className="rounded-xl border border-border bg-card p-6 text-center">
          <p className="text-foreground mb-4">
            {demoMode
              ? "5-minute demo. Timed behavioral interview with real-time voice."
              : "30-minute timed behavioral interview with real-time voice."}
          </p>
          <button
            type="button"
            onClick={startSession}
            className="rounded-lg bg-accent px-6 py-3 text-sm font-medium text-white hover:bg-accent/90 transition-colors"
          >
            {demoMode ? "Start 5-minute demo" : "Start live interview"}
          </button>
        </div>
      )}

      {(status === "creating" || status === "connecting") && (
        <div className="rounded-xl border border-border bg-card p-6 text-center text-muted-foreground">
          <p>{status === "creating" ? "Creating session…" : "Connecting…"}</p>
          <div className="mt-3 flex justify-center gap-1">
            <span className="w-2 h-2 rounded-full bg-muted animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-2 h-2 rounded-full bg-muted animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-2 h-2 rounded-full bg-muted animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      )}

      {status === "connected" && (
        <div className="rounded-xl border border-border bg-card p-6 text-center text-muted-foreground text-sm">
          <p>You are in a live voice interview. Speak naturally. The AI will respond in real time.</p>
          <p className="mt-2">Click &quot;End interview&quot; when finished, or wait for the timer.</p>
        </div>
      )}
    </div>
  );
}
