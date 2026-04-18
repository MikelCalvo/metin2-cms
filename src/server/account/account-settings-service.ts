import "server-only";

import { findAccountById, updateLegacyAccountPassword } from "@/server/account/account-repository";
import type {
  ChangeAuthenticatedAccountPasswordInput,
  ChangeAuthenticatedAccountPasswordResult,
} from "@/server/account/account-settings-types";
import { createAuthAuditLogEntry } from "@/server/auth/auth-audit-repository";
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

export async function changeAuthenticatedAccountPassword(
  input: ChangeAuthenticatedAccountPasswordInput,
): Promise<ChangeAuthenticatedAccountPasswordResult> {
  const account = await findAccountById(input.accountId);

  if (!account || account.status !== "OK") {
    return {
      ok: false,
      code: "account_unavailable",
      message: "This account is not available right now.",
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
      ip: input.ip ?? null,
      userAgent: input.userAgent ?? null,
      success: 0,
      detail: buildAccountPasswordChangeAuditDetail("invalid_current_password"),
      createdAt: changedAt,
    });

    return {
      ok: false,
      code: "invalid_current_password",
      message: "Please enter the current password correctly.",
      fieldErrors: {
        currentPassword: ["Current password is incorrect."],
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
    ip: input.ip ?? null,
    userAgent: input.userAgent ?? null,
    success: 1,
    detail: buildAccountPasswordChangeAuditDetail("password_updated"),
    createdAt: changedAt,
  });

  return {
    ok: true,
    message: "Password updated successfully.",
  };
}
