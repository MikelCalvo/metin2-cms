import "server-only";

import { createHash, randomBytes } from "node:crypto";

import { getEnv } from "@/lib/env";
import {
  findAccountByLogin,
  updateLegacyAccountPassword,
} from "@/server/account/account-repository";
import { hashPasswordWithLegacyAlgorithm } from "@/server/auth/password-compat";
import {
  consumePasswordRecoveryToken,
  createPasswordRecoveryToken,
  findActivePasswordRecoveryTokenByHash,
} from "@/server/recovery/recovery-repository";
import type {
  PasswordResetInput,
  RecoveryRequestInput,
  RequestPasswordRecoveryResult,
  ResetPasswordWithRecoveryTokenResult,
} from "@/server/recovery/types";
import { revokeSessionsForAccount } from "@/server/session/session-service";

const PASSWORD_RECOVERY_TOKEN_TTL_MS = 1000 * 60 * 60;
const GENERIC_RECOVERY_MESSAGE =
  "If the login and email match an account, a reset link has been created.";

function toMysqlDateTime(date: Date) {
  return date.toISOString().slice(0, 19).replace("T", " ");
}

function isPreviewAllowed() {
  return process.env.NODE_ENV !== "production";
}

function buildPasswordRecoveryUrl(token: string) {
  return new URL(`/reset-password?token=${token}`, getEnv().APP_BASE_URL).toString();
}

function createPasswordRecoveryTokenValue() {
  return randomBytes(32).toString("hex");
}

export function hashPasswordRecoveryToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function requestPasswordRecovery(
  input: RecoveryRequestInput,
): Promise<RequestPasswordRecoveryResult> {
  const account = await findAccountByLogin(input.login);

  if (!account || account.email !== input.email || account.status !== "OK") {
    return {
      ok: true,
      message: GENERIC_RECOVERY_MESSAGE,
    };
  }

  const rawToken = createPasswordRecoveryTokenValue();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + PASSWORD_RECOVERY_TOKEN_TTL_MS);

  await createPasswordRecoveryToken({
    accountId: account.id,
    login: account.login,
    email: account.email,
    tokenHash: hashPasswordRecoveryToken(rawToken),
    requestedIp: input.ip ?? null,
    requestedUserAgent: input.userAgent ?? null,
    createdAt: toMysqlDateTime(now),
    expiresAt: toMysqlDateTime(expiresAt),
    consumedAt: null,
  });

  return {
    ok: true,
    message: GENERIC_RECOVERY_MESSAGE,
    previewResetUrl: isPreviewAllowed()
      ? buildPasswordRecoveryUrl(rawToken)
      : undefined,
  };
}

export async function resetPasswordWithRecoveryToken(
  input: PasswordResetInput,
): Promise<ResetPasswordWithRecoveryTokenResult> {
  const tokenHash = hashPasswordRecoveryToken(input.token);
  const recoveryToken = await findActivePasswordRecoveryTokenByHash(
    tokenHash,
    toMysqlDateTime(new Date()),
  );

  if (!recoveryToken) {
    return {
      ok: false,
      code: "invalid_or_expired_token",
      message: "This recovery link is invalid or has expired.",
      fieldErrors: {
        token: ["This recovery link is invalid or has expired."],
      },
    };
  }

  const passwordHash = await hashPasswordWithLegacyAlgorithm(input.password);

  await updateLegacyAccountPassword(recoveryToken.accountId, passwordHash);
  await consumePasswordRecoveryToken(
    recoveryToken.id,
    toMysqlDateTime(new Date()),
  );
  await revokeSessionsForAccount(recoveryToken.accountId);

  return {
    ok: true,
    message: "Password updated successfully. You can now sign in with the new password.",
  };
}
