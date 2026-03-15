"use client";

import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { AuthNav } from "@/components/auth/AuthNav";

const navLinks = [
  { href: "/live-interview", label: "Live" },
  { href: "/interview", label: "Learning" },
  { href: "/translate", label: "Translate" },
  { href: "/opportunities", label: "Community" },
  { href: "/progress", label: "Progress" },
  { href: "/badges", label: "Badges" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-12 min-h-0 max-w-5xl items-center justify-between gap-4 px-3 sm:px-4">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-1.5 font-semibold text-foreground hover:text-accent transition-colors"
        >
          <Image src="/logo.svg" alt="" width={24} height={24} className="shrink-0" />
          <span>Aptitude AI</span>
        </Link>
        <nav className="flex min-w-0 flex-1 items-center justify-end gap-0.5 sm:gap-1">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="rounded-md px-2 py-1.5 text-xs sm:text-sm text-muted hover:bg-muted-bg hover:text-foreground transition-colors whitespace-nowrap"
            >
              {label}
            </Link>
          ))}
          <span className="mx-1 w-px self-stretch bg-border shrink-0" aria-hidden />
          <AuthNav />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
