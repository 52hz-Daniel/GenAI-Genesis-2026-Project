"use client";

import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { AuthNav } from "@/components/auth/AuthNav";

export function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-foreground hover:text-accent transition-colors"
        >
          <Image src="/logo.svg" alt="" width={28} height={28} className="shrink-0" />
          <span>Aptitude AI</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-4">
          <Link
            href="/live-interview"
            className="rounded-md px-3 py-2 text-sm text-muted hover:bg-muted-bg hover:text-foreground transition-colors"
          >
            Live Interview
          </Link>
          <Link
            href="/interview"
            className="rounded-md px-3 py-2 text-sm text-muted hover:bg-muted-bg hover:text-foreground transition-colors"
          >
            Learning
          </Link>
          <Link
            href="/translate"
            className="rounded-md px-3 py-2 text-sm text-muted hover:bg-muted-bg hover:text-foreground transition-colors"
          >
            Translate
          </Link>
          <Link
            href="/opportunities"
            className="rounded-md px-3 py-2 text-sm text-muted hover:bg-muted-bg hover:text-foreground transition-colors"
          >
            Community
          </Link>
          <Link
            href="/progress"
            className="rounded-md px-3 py-2 text-sm text-muted hover:bg-muted-bg hover:text-foreground transition-colors"
          >
            My Progress
          </Link>
          <Link
            href="/badges"
            className="rounded-md px-3 py-2 text-sm text-muted hover:bg-muted-bg hover:text-foreground transition-colors"
          >
            Badges
          </Link>
          <AuthNav />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
