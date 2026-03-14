"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { AuthNav } from "@/components/auth/AuthNav";

export function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="font-semibold text-foreground hover:text-accent transition-colors"
        >
          Aptitude AI
        </Link>
        <nav className="flex items-center gap-1 sm:gap-4">
          <Link
            href="/translate"
            className="rounded-md px-3 py-2 text-sm text-muted hover:bg-muted-bg hover:text-foreground transition-colors"
          >
            Translate
          </Link>
          <Link
            href="/interview"
            className="rounded-md px-3 py-2 text-sm text-muted hover:bg-muted-bg hover:text-foreground transition-colors"
          >
            Interview
          </Link>
          <Link
            href="/badges"
            className="rounded-md px-3 py-2 text-sm text-muted hover:bg-muted-bg hover:text-foreground transition-colors"
          >
            Badges
          </Link>
          <Link
            href="/progress"
            className="rounded-md px-3 py-2 text-sm text-muted hover:bg-muted-bg hover:text-foreground transition-colors"
          >
            Progress
          </Link>
          <AuthNav />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
