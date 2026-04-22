import { redirect } from "next/navigation";

import { RecoveryRequestForm } from "@/components/auth/recovery-request-form";
import { CmsPageShell } from "@/components/cms/page-shell";
import { getCurrentAuthenticatedAccount } from "@/server/auth/current-account";
import { getRecoveryDeliveryConfig } from "@/server/recovery/recovery-delivery";

export default async function RecoverPage() {
  const authenticated = await getCurrentAuthenticatedAccount();
  const recoveryDeliveryConfig = getRecoveryDeliveryConfig();

  if (authenticated) {
    redirect("/account");
  }

  return (
    <CmsPageShell containerClassName="justify-center">
      <div className="mx-auto flex w-full max-w-xl items-center">
        <RecoveryRequestForm temporaryDeliveryMode={recoveryDeliveryConfig.mode} />
      </div>
    </CmsPageShell>
  );
}
