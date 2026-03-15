"use client";

import { signIn } from "next-auth/react";

const PROVIDER_LABELS: Record<string, string> = {
  google: "Google",
  "azure-ad": "Microsoft",
  apple: "Apple",
};

export function SignInButton({ providers = ["google"] }: { providers?: string[] }) {
  return (
    <div className="flex flex-col gap-3">
      {providers.map((providerId) => (
        <button
          key={providerId}
          type="button"
          onClick={() => signIn(providerId, { callbackUrl: "/" })}
          className="rounded-xl bg-accent text-white px-6 py-3 font-medium hover:bg-accent/90 transition-colors w-full"
        >
          Sign in with {PROVIDER_LABELS[providerId] ?? providerId}
        </button>
      ))}
    </div>
  );
}
