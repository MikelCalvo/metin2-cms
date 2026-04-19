"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { defaultLocale } from "@/lib/i18n/config";
import { getCurrentLocale } from "@/lib/i18n/server";
import { getMessages } from "@/lib/i18n/messages";
import {
  changeAuthenticatedAccountPassword,
  updateAuthenticatedAccountProfile,
} from "@/server/account/account-settings-service";
import type {
  AccountPasswordChangeActionState,
  AccountProfileActionState,
} from "@/server/account/account-settings-types";
import {
  parseAccountPasswordChangeFormData,
  parseAccountProfileFormData,
} from "@/server/account/account-settings-validation";
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

  const locale = await getCurrentLocale();
  const messages = getMessages(locale);
  const metadata = await getRequestMetadata();
  const parsed =
    locale === defaultLocale
      ? parseAccountPasswordChangeFormData(formData, metadata)
      : parseAccountPasswordChangeFormData(formData, metadata, locale);

  if (!parsed.success) {
    return {
      status: "error",
      message: messages.serverMessages.correctPasswordFields,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const result =
    locale === defaultLocale
      ? await changeAuthenticatedAccountPassword({
          accountId: authenticated.account.id,
          login: authenticated.account.login,
          currentSessionId: authenticated.session.id,
          currentPassword: parsed.data.currentPassword,
          newPassword: parsed.data.newPassword,
          ip: parsed.data.ip,
          userAgent: parsed.data.userAgent,
        })
      : await changeAuthenticatedAccountPassword(
          {
            accountId: authenticated.account.id,
            login: authenticated.account.login,
            currentSessionId: authenticated.session.id,
            currentPassword: parsed.data.currentPassword,
            newPassword: parsed.data.newPassword,
            ip: parsed.data.ip,
            userAgent: parsed.data.userAgent,
          },
          locale,
        );

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

export async function updateProfileAction(
  _previousState: AccountProfileActionState,
  formData: FormData,
): Promise<AccountProfileActionState> {
  const authenticated = await getCurrentAuthenticatedAccount();

  if (!authenticated) {
    redirect("/login");
  }

  const locale = await getCurrentLocale();
  const messages = getMessages(locale);
  const metadata = await getRequestMetadata();
  const parsed =
    locale === defaultLocale
      ? parseAccountProfileFormData(formData, metadata)
      : parseAccountProfileFormData(formData, metadata, locale);

  if (!parsed.success) {
    return {
      status: "error",
      message: messages.serverMessages.correctProfileFields,
      fieldErrors: parsed.error.flatten().fieldErrors,
      values: {
        email:
          typeof formData.get("email") === "string"
            ? (formData.get("email") as string)
            : authenticated.account.email,
        socialId:
          typeof formData.get("socialId") === "string"
            ? (formData.get("socialId") as string)
            : authenticated.account.socialId,
      },
    };
  }

  const result =
    locale === defaultLocale
      ? await updateAuthenticatedAccountProfile({
          accountId: authenticated.account.id,
          login: authenticated.account.login,
          email: parsed.data.email,
          socialId: parsed.data.socialId,
          ip: parsed.data.ip,
          userAgent: parsed.data.userAgent,
        })
      : await updateAuthenticatedAccountProfile(
          {
            accountId: authenticated.account.id,
            login: authenticated.account.login,
            email: parsed.data.email,
            socialId: parsed.data.socialId,
            ip: parsed.data.ip,
            userAgent: parsed.data.userAgent,
          },
          locale,
        );

  if (!result.ok) {
    return {
      status: "error",
      message: result.message,
      fieldErrors: result.fieldErrors,
      values: {
        email: parsed.data.email,
        socialId: parsed.data.socialId,
      },
    };
  }

  revalidatePath("/account");

  return {
    status: "success",
    message: result.message,
    values: {
      email: parsed.data.email,
      socialId: parsed.data.socialId,
    },
  };
}
