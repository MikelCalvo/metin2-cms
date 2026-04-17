"use server";

import { redirect } from "next/navigation";

import { authenticateLegacyAccount, registerLegacyCompatibleAccount } from "@/server/account/account-service";
import { createAuthErrorState } from "@/server/auth/action-state";
import { getRequestMetadata } from "@/server/auth/request-metadata";
import type { AuthActionState } from "@/server/auth/types";
import { parseLoginFormData, parseRegisterFormData } from "@/server/auth/validation";
import { clearAuthenticatedSession, issueAuthenticatedSession } from "@/server/session/session-service";

export async function loginAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const metadata = await getRequestMetadata();
  const parsed = parseLoginFormData(formData, metadata);

  if (!parsed.success) {
    return createAuthErrorState({
      message: "Please correct the highlighted login fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
      values: {
        login: typeof formData.get("login") === "string" ? (formData.get("login") as string) : "",
      },
    });
  }

  const result = await authenticateLegacyAccount(parsed.data);

  if (!result.ok) {
    return createAuthErrorState({
      message: result.message,
      values: {
        login: parsed.data.login,
      },
    });
  }

  await issueAuthenticatedSession({
    accountId: result.account.id,
    login: result.account.login,
    ip: parsed.data.ip,
    userAgent: parsed.data.userAgent,
  });

  redirect("/account");
}

export async function registerAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const metadata = await getRequestMetadata();
  const parsed = parseRegisterFormData(formData, metadata);

  if (!parsed.success) {
    return createAuthErrorState({
      message: "Please correct the highlighted registration fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
      values: {
        login: typeof formData.get("login") === "string" ? (formData.get("login") as string) : "",
        email: typeof formData.get("email") === "string" ? (formData.get("email") as string) : "",
        socialId: typeof formData.get("socialId") === "string" ? (formData.get("socialId") as string) : "",
      },
    });
  }

  const result = await registerLegacyCompatibleAccount(parsed.data);

  if (!result.ok) {
    return createAuthErrorState({
      message: result.message,
      fieldErrors: result.fieldErrors,
      values: {
        login: parsed.data.login,
        email: parsed.data.email,
        socialId: parsed.data.socialId,
      },
    });
  }

  await issueAuthenticatedSession({
    accountId: result.account.id,
    login: result.account.login,
    ip: parsed.data.ip,
    userAgent: parsed.data.userAgent,
  });

  redirect("/account");
}

export async function logoutAction() {
  await clearAuthenticatedSession();
  redirect("/login");
}
