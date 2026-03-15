import { MockInterview } from "@/components/MockInterview/MockInterview";

export const metadata = {
  title: "Mock interview | Aptitude AI",
  description: "Practice behavioral questions with supportive AI and earn a badge.",
};

export default function InterviewPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="font-display text-2xl font-bold tracking-tight text-foreground mb-2">
        Practice interview
      </h1>
      <p className="text-muted mb-6">
        Answer behavioral questions with supportive AI. Get framework-based feedback and unlock a badge when you finish.
      </p>
      <MockInterview />
    </div>
  );
}
