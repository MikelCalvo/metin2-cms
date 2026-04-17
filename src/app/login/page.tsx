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
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-16">
      <LoginForm notice={notice} />
    </main>
  );
}
