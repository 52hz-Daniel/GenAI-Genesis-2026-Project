import { ExperienceTranslator } from "@/components/ExperienceTranslator/ExperienceTranslator";

export const metadata = {
  title: "Translate experience | Aptitude AI",
  description: "Turn your class or work experience into ATS friendly resume bullets.",
};

export default function TranslatePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="text-2xl font-bold text-foreground mb-2">
        Translate an experience
      </h1>
      <p className="text-muted mb-8">
        Paste what you did. We will give you three professional resume bullet options. Try the example in the README for judges.
      </p>
      <ExperienceTranslator />
    </div>
  );
}
