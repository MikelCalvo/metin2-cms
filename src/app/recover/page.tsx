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
    <main className="min-h-screen bg-[#09090b] px-6 py-16 text-zinc-100">
      <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-3xl flex-col justify-center">
        <RecoveryRequestForm temporaryDeliveryMode={recoveryDeliveryConfig.mode} />
      </div>
    </main>
  );
}
