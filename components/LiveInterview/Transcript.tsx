"use client";

type TranscriptProps = {
  messages: { role: "user" | "assistant"; content: string }[];
  className?: string;
};

export function Transcript({ messages, className = "" }: TranscriptProps) {
  if (messages.length === 0) {
    return (
      <div className={`rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground ${className}`}>
        Transcript will appear here as you speak.
      </div>
    );
  }
  return (
    <div className={`rounded-xl border border-border bg-card p-4 space-y-2 max-h-48 overflow-y-auto ${className}`}>
      {messages.map((m, i) => (
        <div
          key={i}
          className={m.role === "user" ? "text-right" : "text-left"}
        >
          <span className="text-xs font-medium text-muted-foreground mr-2">
            {m.role === "user" ? "You" : "Interviewer"}:
          </span>
          <span className="text-sm text-foreground">{m.content}</span>
        </div>
      ))}
    </div>
  );
}
