import { redirect } from "next/navigation";

import { RecoveryRequestForm } from "@/components/auth/recovery-request-form";
import { getCurrentAuthenticatedAccount } from "@/server/auth/current-account";
import { getRecoveryDeliveryConfig } from "@/server/recovery/recovery-delivery";

export default async function RecoverPage() {
  const authenticated = await getCurrentAuthenticatedAccount();
  const recoveryDeliveryConfig = getRecoveryDeliveryConfig();

  if (authenticated) {
    redirect("/account");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
      <RecoveryRequestForm temporaryDeliveryMode={recoveryDeliveryConfig.mode} />
    </main>
  );
}
