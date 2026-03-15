import { ExperienceTranslator } from "@/components/ExperienceTranslator/ExperienceTranslator";

export const metadata = {
  title: "Translate experience | Aptitude AI",
  description: "Turn your class or work experience into ATS friendly resume bullets.",
};

export default function TranslatePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="font-display text-2xl font-bold tracking-tight text-foreground mb-2">
        Translate an experience
      </h1>
      <p className="text-muted mb-8">
        Paste what you did in class or at work. Get three professional, ATS-friendly resume bullet options in seconds.
      </p>
      <ExperienceTranslator />
    </div>
  );
}
