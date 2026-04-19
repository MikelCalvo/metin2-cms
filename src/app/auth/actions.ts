"use server";

import { redirect } from "next/navigation";

import { defaultLocale } from "@/lib/i18n/config";
import { getCurrentLocale } from "@/lib/i18n/server";
import {
  authenticateLegacyAccount,
  registerLegacyCompatibleAccount,
} from "@/server/account/account-service";
import { createAuthErrorState } from "@/server/auth/action-state";
import { getRequestMetadata } from "@/server/auth/request-metadata";
import type { AuthActionState } from "@/server/auth/types";
import {
  parseLoginFormData,
  parseRegisterFormData,
} from "@/server/auth/validation";
import {
  createRecoveryErrorState,
  createRecoverySuccessState,
} from "@/server/recovery/action-state";
import {
  requestPasswordRecovery,
  resetPasswordWithRecoveryToken,
} from "@/server/recovery/recovery-service";
import type { RecoveryActionState } from "@/server/recovery/types";
import {
  parseRecoveryRequestFormData,
  parseResetPasswordFormData,
} from "@/server/recovery/validation";
import {
  clearAuthenticatedSession,
  issueAuthenticatedSession,
} from "@/server/session/session-service";
import { getMessages } from "@/lib/i18n/messages";

export async function loginAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const locale = await getCurrentLocale();
  const messages = getMessages(locale);
  const metadata = await getRequestMetadata();
  const parsed =
    locale === defaultLocale
      ? parseLoginFormData(formData, metadata)
      : parseLoginFormData(formData, metadata, locale);

  if (!parsed.success) {
    return createAuthErrorState({
      message: messages.serverMessages.correctLoginFields,
      fieldErrors: parsed.error.flatten().fieldErrors,
      values: {
        login:
          typeof formData.get("login") === "string"
            ? (formData.get("login") as string)
            : "",
      },
    });
  }

  const result =
    locale === defaultLocale
      ? await authenticateLegacyAccount(parsed.data)
      : await authenticateLegacyAccount(parsed.data, locale);

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
  const locale = await getCurrentLocale();
  const messages = getMessages(locale);
  const metadata = await getRequestMetadata();
  const parsed =
    locale === defaultLocale
      ? parseRegisterFormData(formData, metadata)
      : parseRegisterFormData(formData, metadata, locale);

  if (!parsed.success) {
    return createAuthErrorState({
      message: messages.serverMessages.correctRegisterFields,
      fieldErrors: parsed.error.flatten().fieldErrors,
      values: {
        login:
          typeof formData.get("login") === "string"
            ? (formData.get("login") as string)
            : "",
        email:
          typeof formData.get("email") === "string"
            ? (formData.get("email") as string)
            : "",
        socialId:
          typeof formData.get("socialId") === "string"
            ? (formData.get("socialId") as string)
            : "",
      },
    });
  }

  const result =
    locale === defaultLocale
      ? await registerLegacyCompatibleAccount(parsed.data)
      : await registerLegacyCompatibleAccount(parsed.data, locale);

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

export async function requestRecoveryAction(
  _previousState: RecoveryActionState,
  formData: FormData,
): Promise<RecoveryActionState> {
  const locale = await getCurrentLocale();
  const messages = getMessages(locale);
  const metadata = await getRequestMetadata();
  const parsed =
    locale === defaultLocale
      ? parseRecoveryRequestFormData(formData, metadata)
      : parseRecoveryRequestFormData(formData, metadata, locale);

  if (!parsed.success) {
    return createRecoveryErrorState({
      message: messages.serverMessages.correctRecoveryFields,
      fieldErrors: parsed.error.flatten().fieldErrors,
      values: {
        login:
          typeof formData.get("login") === "string"
            ? (formData.get("login") as string)
            : "",
        email:
          typeof formData.get("email") === "string"
            ? (formData.get("email") as string)
            : "",
      },
    });
  }

  const result =
    locale === defaultLocale
      ? await requestPasswordRecovery(parsed.data)
      : await requestPasswordRecovery(parsed.data, locale);

  return createRecoverySuccessState({
    message: result.message,
    values: {
      login: parsed.data.login,
      email: parsed.data.email,
    },
    previewResetUrl: result.previewResetUrl,
  });
}

export async function resetPasswordAction(
  _previousState: RecoveryActionState,
  formData: FormData,
): Promise<RecoveryActionState> {
  const locale = await getCurrentLocale();
  const messages = getMessages(locale);
  const parsed =
    locale === defaultLocale
      ? parseResetPasswordFormData(formData)
      : parseResetPasswordFormData(formData, locale);

  if (!parsed.success) {
    return createRecoveryErrorState({
      message: messages.serverMessages.correctResetFields,
      fieldErrors: parsed.error.flatten().fieldErrors,
      values: {
        token:
          typeof formData.get("token") === "string"
            ? (formData.get("token") as string)
            : "",
      },
    });
  }

  const result =
    locale === defaultLocale
      ? await resetPasswordWithRecoveryToken(parsed.data)
      : await resetPasswordWithRecoveryToken(parsed.data, locale);

  if (!result.ok) {
    return createRecoveryErrorState({
      message: result.message,
      fieldErrors: result.fieldErrors,
      values: {
        token: parsed.data.token,
      },
    });
  }

  redirect("/login?recovery=success");
}

export async function logoutAction() {
  await clearAuthenticatedSession();
  redirect("/login");
}
