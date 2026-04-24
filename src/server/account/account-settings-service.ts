import "server-only";

import { defaultLocale, type Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import {
  findAccountById,
  updateLegacyAccountPassword,
  updateLegacyAccountProfile,
} from "@/server/account/account-repository";
import type {
  ChangeAuthenticatedAccountPasswordInput,
  ChangeAuthenticatedAccountPasswordResult,
  UpdateAuthenticatedAccountProfileInput,
  UpdateAuthenticatedAccountProfileResult,
} from "@/server/account/account-settings-types";
import { createAuthAuditLogEntry } from "@/server/auth/auth-audit-repository";
import { normalizeRequestMetadata } from "@/server/auth/request-metadata-normalization";
import {
  hashPasswordWithLegacyAlgorithm,
  verifyLegacyPassword,
} from "@/server/auth/password-compat";
import { revokeOtherSessionsForAccount } from "@/server/session/session-service";

function toMysqlDateTime(date: Date) {
  return date.toISOString().slice(0, 19).replace("T", " ");
}

function buildAccountPasswordChangeAuditDetail(outcome: string) {
  return `outcome=${outcome}`;
}

function buildAccountProfileUpdateAuditDetail(outcome: string) {
  return `outcome=${outcome}`;
}

export async function changeAuthenticatedAccountPassword(
  input: ChangeAuthenticatedAccountPasswordInput,
  locale: Locale = defaultLocale,
): Promise<ChangeAuthenticatedAccountPasswordResult> {
  const account = await findAccountById(input.accountId);
  const serverMessages = getMessages(locale).serverMessages;
  const metadata = normalizeRequestMetadata(input);

  if (!account || account.status !== "OK") {
    return {
      ok: false,
      code: "account_unavailable",
      message: serverMessages.accountUnavailableNow,
    };
  }

  const changedAt = toMysqlDateTime(new Date());
  const currentPasswordMatches = await verifyLegacyPassword(
    input.currentPassword,
    account.password,
  );

  if (!currentPasswordMatches) {
    await createAuthAuditLogEntry({
      eventType: "account.password_change",
      login: input.login,
      accountId: input.accountId,
      ip: metadata.ip,
      userAgent: metadata.userAgent,
      success: 0,
      detail: buildAccountPasswordChangeAuditDetail("invalid_current_password"),
      createdAt: changedAt,
    });

    return {
      ok: false,
      code: "invalid_current_password",
      message: serverMessages.currentPasswordIncorrectMessage,
      fieldErrors: {
        currentPassword: [serverMessages.currentPasswordIncorrectField],
      },
    };
  }

  const newPasswordHash = await hashPasswordWithLegacyAlgorithm(input.newPassword);

  await updateLegacyAccountPassword(input.accountId, newPasswordHash);
  await revokeOtherSessionsForAccount(input.accountId, input.currentSessionId);
  await createAuthAuditLogEntry({
    eventType: "account.password_change",
    login: input.login,
    accountId: input.accountId,
    ip: metadata.ip,
    userAgent: metadata.userAgent,
    success: 1,
    detail: buildAccountPasswordChangeAuditDetail("password_updated"),
    createdAt: changedAt,
  });

  return {
    ok: true,
    message: serverMessages.passwordUpdatedSuccess,
  };
}

export async function updateAuthenticatedAccountProfile(
  input: UpdateAuthenticatedAccountProfileInput,
  locale: Locale = defaultLocale,
): Promise<UpdateAuthenticatedAccountProfileResult> {
  const account = await findAccountById(input.accountId);
  const serverMessages = getMessages(locale).serverMessages;
  const metadata = normalizeRequestMetadata(input);

  if (!account || account.status !== "OK") {
    return {
      ok: false,
      code: "account_unavailable",
      message: serverMessages.accountUnavailableNow,
    };
  }

  const updatedAt = toMysqlDateTime(new Date());

  await updateLegacyAccountProfile(input.accountId, {
    email: input.email,
    socialId: input.socialId,
  });
  await createAuthAuditLogEntry({
    eventType: "account.profile_update",
    login: input.login,
    accountId: input.accountId,
    ip: metadata.ip,
    userAgent: metadata.userAgent,
    success: 1,
    detail: buildAccountProfileUpdateAuditDetail("profile_updated"),
    createdAt: updatedAt,
  });

  return {
    ok: true,
    message: serverMessages.profileUpdatedSuccess,
  };
}
