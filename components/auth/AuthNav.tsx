"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";

export function AuthNav() {
  const { data: session, status } = useSession();
  if (status === "loading") {
    return <span className="text-sm text-muted">…</span>;
  }
  if (session?.user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/profile"
          className="rounded-md px-3 py-2 text-sm text-muted hover:bg-muted-bg hover:text-foreground transition-colors"
        >
          Profile
        </Link>
        <span className="text-sm text-muted max-w-[120px] truncate" title={session.user.email ?? undefined}>
          {session.user.name ?? session.user.email ?? "Signed in"}
        </span>
        <button
          type="button"
          onClick={() => signOut()}
          className="rounded-md px-3 py-2 text-sm text-muted hover:bg-muted-bg hover:text-foreground transition-colors"
        >
          Sign out
        </button>
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={() => signIn("google")}
      className="rounded-md px-3 py-2 text-sm text-muted hover:bg-muted-bg hover:text-foreground transition-colors"
    >
      Sign in
    </button>
  );
}
