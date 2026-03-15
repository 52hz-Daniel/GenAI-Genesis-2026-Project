import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { SignInButton } from "./SignInButton";

export default async function SignInPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/");
  const providers: string[] = ["google"];
  if (process.env.AZURE_AD_CLIENT_ID) providers.push("azure-ad");
  if (process.env.APPLE_ID && process.env.APPLE_CLIENT_SECRET) providers.push("apple");
  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <h1 className="font-display text-2xl font-bold tracking-tight text-foreground mb-2">Sign in</h1>
      <p className="text-muted mb-6">Use your account to save your profile and progress.</p>
      <SignInButton providers={providers} />
    </div>
  );
}
