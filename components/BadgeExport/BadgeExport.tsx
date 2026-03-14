"use client";

import { useCallback, useState } from "react";
import { logEvent } from "@/lib/analytics";
import { INTERVIEW_BADGE_TITLE } from "@/lib/badges";

const SHARE_TEXT = `I earned the ${INTERVIEW_BADGE_TITLE} badge on Aptitude AI. Practicing behavioral interviews with supportive AI.`;

export function BadgeExport() {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(SHARE_TEXT).then(() => {
      logEvent("badge_copied");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  const downloadImage = useCallback(() => {
    const canvas = document.createElement("canvas");
    const size = 400;
    canvas.width = size;
    canvas.height = 220;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const isDark = document.documentElement.classList.contains("dark");
    ctx.fillStyle = isDark ? "#1e293b" : "#ffffff";
    ctx.fillRect(0, 0, size, 220);
    ctx.strokeStyle = isDark ? "#38bdf8" : "#0ea5e9";
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, size - 4, 216);
    ctx.fillStyle = isDark ? "#f1f5f9" : "#1e293b";
    ctx.font = "bold 24px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Aptitude AI", size / 2, 80);
    ctx.font = "18px system-ui, sans-serif";
    ctx.fillText(INTERVIEW_BADGE_TITLE + " Badge", size / 2, 120);
    ctx.font = "14px system-ui, sans-serif";
    ctx.fillStyle = isDark ? "#94a3b8" : "#64748b";
    ctx.fillText("Earned through behavioral interview practice", size / 2, 160);
    const link = document.createElement("a");
    link.download = "aptitude-ai-badge.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
    logEvent("badge_image_downloaded");
  }, []);

  const shareToLinkedIn = useCallback(() => {
    logEvent("share_to_linkedin_click");
    const url = encodeURIComponent(
      typeof window !== "undefined" ? window.location.origin : ""
    );
    const text = encodeURIComponent(SHARE_TEXT);
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${url}&summary=${text}`,
      "_blank",
      "noopener,noreferrer,width=600,height=600"
    );
  }, []);

  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={copyToClipboard}
        className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium hover:bg-muted-bg transition-colors"
      >
        {copied ? "Copied!" : "Copy achievement text"}
      </button>
      <button
        type="button"
        onClick={downloadImage}
        className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium hover:bg-muted-bg transition-colors"
      >
        Download badge image
      </button>
      <button
        type="button"
        onClick={shareToLinkedIn}
        className="rounded-xl bg-[#0A66C2] text-white px-4 py-2.5 text-sm font-medium hover:bg-[#004182] transition-colors"
      >
        Share to LinkedIn
      </button>
    </div>
  );
}
