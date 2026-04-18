import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { CmsPageShell } from "@/components/cms/page-shell";
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
    <CmsPageShell containerClassName="justify-center">
      <div className="mx-auto flex w-full max-w-md items-center">
        <LoginForm notice={notice} />
      </div>
    </CmsPageShell>
  );
}
