import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { getCurrentAuthenticatedAccount } from "@/server/auth/current-account";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const authenticated = await getCurrentAuthenticatedAccount();

  if (authenticated) {
    redirect("/account");
  }

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const recoveryStatus = resolvedSearchParams.recovery;
  const notice =
    recoveryStatus === "success"
      ? "Password updated successfully. You can now sign in with the new password."
      : undefined;

  return (
    <main className="min-h-screen bg-[#09090b] px-6 py-16 text-zinc-100">
      <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-2xl flex-col justify-center">
        <LoginForm notice={notice} />
      </div>
    </main>
  );
}
