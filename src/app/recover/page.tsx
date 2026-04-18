import Link from "next/link";
import { KeyRoundIcon, MailboxIcon, ShieldCheckIcon } from "lucide-react";
import { redirect } from "next/navigation";

import { RecoveryRequestForm } from "@/components/auth/recovery-request-form";
import { AuthPageShell } from "@/components/cms/auth-page-shell";
import { getCurrentAuthenticatedAccount } from "@/server/auth/current-account";
import { getRecoveryDeliveryConfig } from "@/server/recovery/recovery-delivery";

export default async function RecoverPage() {
  const authenticated = await getCurrentAuthenticatedAccount();
  const recoveryDeliveryConfig = getRecoveryDeliveryConfig();

  if (authenticated) {
    redirect("/account");
  }

  const manualDelivery = recoveryDeliveryConfig.mode === "file";

  return (
    <AuthPageShell
      eyebrow="Account recovery"
      title="Recover access without falling back to the old CMS"
      description="Request a password reset using the login and email stored in the live account database, then complete the reset inside the modern web flow."
      supportEyebrow="Recovery design"
      supportTitle={manualDelivery ? "Temporary operator-assisted delivery" : "Modern reset flow over the legacy account contract"}
      supportDescription={
        manualDelivery
          ? "Until transactional email is introduced, recovery links are queued for operator handling instead of being sent automatically."
          : "The recovery surface stays compatible with the legacy account records while keeping the new CMS workflow separate and auditable."
      }
      supportItems={[
        {
          title: "Identity verification",
          description: "The reset flow requires the same login and email pair already tied to the live Metin2 account.",
          icon: <ShieldCheckIcon className="size-4" />,
        },
        {
          title: manualDelivery ? "Operator queue" : "Reset link preview",
          description: manualDelivery
            ? "Matching recovery requests are queued on the server so an operator can deliver the reset link safely."
            : "Preview mode keeps development moving without yet depending on production email infrastructure.",
          icon: <MailboxIcon className="size-4" />,
        },
        {
          title: "Password rotation",
          description: "Once the link is opened, the new password is written in the legacy-compatible format expected by the current stack.",
          icon: <KeyRoundIcon className="size-4" />,
        },
      ]}
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span>Remembered your credentials?</span>
          <Link href="/login" className="text-zinc-100 underline-offset-4 hover:underline">
            Back to sign in
          </Link>
        </div>
      }
    >
      <RecoveryRequestForm temporaryDeliveryMode={recoveryDeliveryConfig.mode} />
    </AuthPageShell>
  );
}
