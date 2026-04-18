"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { changeAuthenticatedAccountPassword } from "@/server/account/account-settings-service";
import type { AccountPasswordChangeActionState } from "@/server/account/account-settings-types";
import { parseAccountPasswordChangeFormData } from "@/server/account/account-settings-validation";
import { getCurrentAuthenticatedAccount } from "@/server/auth/current-account";
import { getRequestMetadata } from "@/server/auth/request-metadata";
import {
  revokeOtherSessionsForAccount,
  revokeSessionForAccount,
} from "@/server/session/session-service";

export async function closeOtherSessionsAction() {
  const authenticated = await getCurrentAuthenticatedAccount();

  if (!authenticated) {
    redirect("/login");
  }

  await revokeOtherSessionsForAccount(
    authenticated.account.id,
    authenticated.session.id,
  );

  redirect("/account");
}

export async function revokeSessionAction(formData: FormData) {
  const authenticated = await getCurrentAuthenticatedAccount();

  if (!authenticated) {
    redirect("/login");
  }

  const sessionId = formData.get("sessionId");

  if (typeof sessionId === "string" && sessionId.length > 0) {
    await revokeSessionForAccount(
      authenticated.account.id,
      sessionId,
      authenticated.session.id,
    );
  }

  redirect("/account");
}

export async function changePasswordAction(
  _previousState: AccountPasswordChangeActionState,
  formData: FormData,
): Promise<AccountPasswordChangeActionState> {
  const authenticated = await getCurrentAuthenticatedAccount();

  if (!authenticated) {
    redirect("/login");
  }

  const metadata = await getRequestMetadata();
  const parsed = parseAccountPasswordChangeFormData(formData, metadata);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please correct the highlighted password fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const result = await changeAuthenticatedAccountPassword({
    accountId: authenticated.account.id,
    login: authenticated.account.login,
    currentSessionId: authenticated.session.id,
    currentPassword: parsed.data.currentPassword,
    newPassword: parsed.data.newPassword,
    ip: parsed.data.ip,
    userAgent: parsed.data.userAgent,
  });

  if (!result.ok) {
    return {
      status: "error",
      message: result.message,
      fieldErrors: result.fieldErrors,
    };
  }

  revalidatePath("/account");

  return {
    status: "success",
    message: result.message,
  };
}
