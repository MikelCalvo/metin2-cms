import Link from "next/link";
import { KeyRoundIcon, MailboxIcon, ShieldCheckIcon } from "lucide-react";
import { redirect } from "next/navigation";

import { RecoveryRequestForm } from "@/components/auth/recovery-request-form";
import { AuthPageShell } from "@/components/cms/auth-page-shell";
import { getMessagesForRequest } from "@/lib/i18n/server";
import { getCurrentAuthenticatedAccount } from "@/server/auth/current-account";
import { getRecoveryDeliveryConfig } from "@/server/recovery/recovery-delivery";

export default async function RecoverPage() {
  const authenticated = await getCurrentAuthenticatedAccount();
  const recoveryDeliveryConfig = getRecoveryDeliveryConfig();

  if (authenticated) {
    redirect("/account");
  }

  const manualDelivery = recoveryDeliveryConfig.mode === "file";
  const messages = await getMessagesForRequest();

  return (
    <AuthPageShell
      eyebrow={messages.recoverPage.eyebrow}
      title={messages.recoverPage.title}
      description={messages.recoverPage.description}
      supportEyebrow={messages.recoverPage.supportEyebrow}
      supportTitle={manualDelivery ? messages.recoverPage.supportTitleManual : messages.recoverPage.supportTitleAuto}
      supportDescription={
        manualDelivery
          ? messages.recoverPage.supportDescriptionManual
          : messages.recoverPage.supportDescriptionAuto
      }
      supportItems={[
        {
          title: messages.recoverPage.items.identityTitle,
          description: messages.recoverPage.items.identityDescription,
          icon: <ShieldCheckIcon className="size-4" />,
        },
        {
          title: manualDelivery
            ? messages.recoverPage.items.queueTitle
            : messages.recoverPage.items.previewTitle,
          description: manualDelivery
            ? messages.recoverPage.items.queueDescription
            : messages.recoverPage.items.previewDescription,
          icon: <MailboxIcon className="size-4" />,
        },
        {
          title: messages.recoverPage.items.passwordRotationTitle,
          description: messages.recoverPage.items.passwordRotationDescription,
          icon: <KeyRoundIcon className="size-4" />,
        },
      ]}
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span>{messages.recoverPage.footerPrompt}</span>
          <Link href="/login" className="text-zinc-100 underline-offset-4 hover:underline">
            {messages.common.backToSignIn}
          </Link>
        </div>
      }
    >
      <RecoveryRequestForm temporaryDeliveryMode={recoveryDeliveryConfig.mode} />
    </AuthPageShell>
  );
}
