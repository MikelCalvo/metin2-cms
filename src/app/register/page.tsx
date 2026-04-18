import Link from "next/link";
import { BadgeCheckIcon, ShieldCheckIcon, UserRoundPlusIcon } from "lucide-react";
import { redirect } from "next/navigation";

import { RegisterForm } from "@/components/auth/register-form";
import { AuthPageShell } from "@/components/cms/auth-page-shell";
import { getCurrentAuthenticatedAccount } from "@/server/auth/current-account";

export default async function RegisterPage() {
  const authenticated = await getCurrentAuthenticatedAccount();

  if (authenticated) {
    redirect("/account");
  }

  return (
    <AuthPageShell
      eyebrow="Account creation"
      title="Create a legacy-compatible Metin2 account"
      description="Register once against the real account schema, then keep using the modern CMS for sessions, recovery and future item shop features."
      supportEyebrow="What you are creating"
      supportTitle="A cleaner onboarding layer for the same server account"
      supportDescription="This flow respects the legacy account contract today while giving us a better product surface for everything that comes next."
      supportItems={[
        {
          title: "Live schema fields",
          description: "Login, email, password and delete code map directly to the legacy account table expected by the game stack.",
          icon: <BadgeCheckIcon className="size-4" />,
        },
        {
          title: "Safer web layer",
          description: "Once created, sessions and future CMS-only features stay separate from the old account data model.",
          icon: <ShieldCheckIcon className="size-4" />,
        },
        {
          title: "Future-ready profile",
          description: "This account becomes the base identity for the account center, item shop and later admin experiences.",
          icon: <UserRoundPlusIcon className="size-4" />,
        },
      ]}
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span>Already have an account?</span>
          <Link href="/login" className="text-zinc-100 underline-offset-4 hover:underline">
            Back to sign in
          </Link>
        </div>
      }
    >
      <RegisterForm />
    </AuthPageShell>
  );
}
