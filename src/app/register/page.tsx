import { redirect } from "next/navigation";

import { RegisterForm } from "@/components/auth/register-form";
import { CmsPageShell } from "@/components/cms/page-shell";
import { getCurrentAuthenticatedAccount } from "@/server/auth/current-account";

export default async function RegisterPage() {
  const authenticated = await getCurrentAuthenticatedAccount();

  if (authenticated) {
    redirect("/account");
  }

  return (
    <CmsPageShell containerClassName="justify-center">
      <div className="mx-auto flex w-full max-w-2xl items-center">
        <RegisterForm />
      </div>
    </CmsPageShell>
  );
}
