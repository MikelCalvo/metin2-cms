import Link from "next/link";
import { KeyRoundIcon, ShieldCheckIcon, ShieldIcon } from "lucide-react";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { AuthPageShell } from "@/components/cms/auth-page-shell";
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
    <AuthPageShell
      eyebrow="Secure access"
      title="Sign in to the modern Metin2 CMS"
      description="Use the same legacy-compatible credentials tied to the live account database, then manage your account from a cleaner web surface."
      supportEyebrow="Operational baseline"
      supportTitle="Built around the live server contract"
      supportDescription="The CMS keeps login compatibility with the game stack while isolating sessions, recovery flows and audit history in its own schema."
      supportItems={[
        {
          title: "Session security",
          description: "Review and revoke browser sessions from the account center without touching game-side state.",
          icon: <ShieldCheckIcon className="size-4" />,
        },
        {
          title: "Recovery workflow",
          description: "Reset passwords through the new CMS flow instead of depending on the old PHP stack.",
          icon: <KeyRoundIcon className="size-4" />,
        },
        {
          title: "Legacy-safe auth",
          description: "Compatibility stays intact because login and password rules still respect the live account schema.",
          icon: <ShieldIcon className="size-4" />,
        },
      ]}
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span>Need a new account for the CMS?</span>
          <Link href="/register" className="text-zinc-100 underline-offset-4 hover:underline">
            Create account
          </Link>
        </div>
      }
    >
      <LoginForm notice={notice} />
    </AuthPageShell>
  );
}
