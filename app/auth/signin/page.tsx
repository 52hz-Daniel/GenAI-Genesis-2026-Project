import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { SignInButton } from "./SignInButton";

export default async function SignInPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/");
  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-foreground mb-2">Sign in</h1>
      <p className="text-muted mb-6">Use your Google account to save your profile and progress.</p>
      <SignInButton />
    </div>
  );
}
