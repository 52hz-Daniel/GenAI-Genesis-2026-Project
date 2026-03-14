"use client";

import { signIn } from "next-auth/react";

export function SignInButton() {
  return (
    <button
      type="button"
      onClick={() => signIn("google", { callbackUrl: "/" })}
      className="rounded-xl bg-accent text-white px-6 py-3 font-medium hover:bg-accent/90 transition-colors"
    >
      Sign in with Google
    </button>
  );
}
