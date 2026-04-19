import Link from "next/link";
import { BadgeCheckIcon, ShieldCheckIcon, UserRoundPlusIcon } from "lucide-react";
import { redirect } from "next/navigation";

import { RegisterForm } from "@/components/auth/register-form";
import { AuthPageShell } from "@/components/cms/auth-page-shell";
import { getMessagesForRequest } from "@/lib/i18n/server";
import { getCurrentAuthenticatedAccount } from "@/server/auth/current-account";

export default async function RegisterPage() {
  const authenticated = await getCurrentAuthenticatedAccount();

  if (authenticated) {
    redirect("/account");
  }

  const messages = await getMessagesForRequest();

  return (
    <AuthPageShell
      eyebrow={messages.registerPage.eyebrow}
      title={messages.registerPage.title}
      description={messages.registerPage.description}
      supportEyebrow={messages.registerPage.supportEyebrow}
      supportTitle={messages.registerPage.supportTitle}
      supportDescription={messages.registerPage.supportDescription}
      supportItems={[
        {
          title: messages.registerPage.items.liveSchemaTitle,
          description: messages.registerPage.items.liveSchemaDescription,
          icon: <BadgeCheckIcon className="size-4" />,
        },
        {
          title: messages.registerPage.items.saferWebTitle,
          description: messages.registerPage.items.saferWebDescription,
          icon: <ShieldCheckIcon className="size-4" />,
        },
        {
          title: messages.registerPage.items.futureReadyTitle,
          description: messages.registerPage.items.futureReadyDescription,
          icon: <UserRoundPlusIcon className="size-4" />,
        },
      ]}
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span>{messages.registerPage.footerPrompt}</span>
          <Link href="/login" className="text-zinc-100 underline-offset-4 hover:underline">
            {messages.common.backToSignIn}
          </Link>
        </div>
      }
    >
      <RegisterForm />
    </AuthPageShell>
  );
}
