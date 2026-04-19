import "server-only";

import { createHash, randomBytes } from "node:crypto";

import { defaultLocale, type Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { getEnv } from "@/lib/env";
import {
  findAccountByLogin,
  updateLegacyAccountPassword,
} from "@/server/account/account-repository";
import {
  countAuthAuditEntriesSince,
  createAuthAuditLogEntry,
} from "@/server/auth/auth-audit-repository";
import { hashPasswordWithLegacyAlgorithm } from "@/server/auth/password-compat";
import {
  deliverPasswordRecoveryLink,
  getRecoveryDeliveryConfig,
} from "@/server/recovery/recovery-delivery";
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

const PASSWORD_RECOVERY_TOKEN_TTL_MS = 60 * 60 * 1000;
const PASSWORD_RECOVERY_REQUEST_WINDOW_MS = 30 * 60 * 1000;
const PASSWORD_RECOVERY_REQUEST_MAX_ATTEMPTS = 3;
const PASSWORD_RECOVERY_REQUEST_EVENT_TYPE = "password_recovery.request";
const PASSWORD_RECOVERY_RESET_EVENT_TYPE = "password_recovery.reset";

function getGenericRecoveryMessage(
  mode: "preview" | "file",
  locale: Locale = defaultLocale,
) {
  const serverMessages = getMessages(locale).serverMessages;

  if (mode === "file") {
    return serverMessages.recoveryFileGeneric;
  }

  return serverMessages.recoveryPreviewGeneric;
}

function toMysqlDateTime(date: Date) {
  return date.toISOString().slice(0, 19).replace("T", " ");
}

function buildPasswordRecoveryUrl(token: string) {
  return new URL(`/reset-password?token=${token}`, getEnv().APP_BASE_URL).toString();
}

function createPasswordRecoveryTokenValue() {
  return randomBytes(32).toString("hex");
}

function buildRecoveryAuditDetail(options: {
  outcome: string;
  deliveryMode?: "preview" | "file";
}) {
  return [
    `outcome=${options.outcome}`,
    options.deliveryMode ? `delivery=${options.deliveryMode}` : null,
  ]
    .filter(Boolean)
    .join(";");
}

export function hashPasswordRecoveryToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function requestPasswordRecovery(
  input: RecoveryRequestInput,
  locale: Locale = defaultLocale,
): Promise<RequestPasswordRecoveryResult> {
  const deliveryConfig = getRecoveryDeliveryConfig();
  const genericMessage = getGenericRecoveryMessage(deliveryConfig.mode, locale);
  const now = new Date();
  const createdAt = toMysqlDateTime(now);
  const windowStartedAt = toMysqlDateTime(
    new Date(now.getTime() - PASSWORD_RECOVERY_REQUEST_WINDOW_MS),
  );
  const recentAttempts = await countAuthAuditEntriesSince({
    eventType: PASSWORD_RECOVERY_REQUEST_EVENT_TYPE,
    login: input.login,
    since: windowStartedAt,
  });

  if (recentAttempts >= PASSWORD_RECOVERY_REQUEST_MAX_ATTEMPTS) {
    await createAuthAuditLogEntry({
      eventType: PASSWORD_RECOVERY_REQUEST_EVENT_TYPE,
      login: input.login,
      accountId: null,
      ip: input.ip ?? null,
      userAgent: input.userAgent ?? null,
      success: 0,
      detail: buildRecoveryAuditDetail({
        outcome: "rate_limited",
        deliveryMode: deliveryConfig.mode,
      }),
      createdAt,
    });

    return {
      ok: true,
      message: genericMessage,
    };
  }

  const account = await findAccountByLogin(input.login);

  if (!account || account.email !== input.email || account.status !== "OK") {
    await createAuthAuditLogEntry({
      eventType: PASSWORD_RECOVERY_REQUEST_EVENT_TYPE,
      login: input.login,
      accountId: account?.id ?? null,
      ip: input.ip ?? null,
      userAgent: input.userAgent ?? null,
      success: 0,
      detail: buildRecoveryAuditDetail({
        outcome: "login_email_mismatch_or_unavailable",
        deliveryMode: deliveryConfig.mode,
      }),
      createdAt,
    });

    return {
      ok: true,
      message: genericMessage,
    };
  }

  const rawToken = createPasswordRecoveryTokenValue();
  const expiresAt = new Date(now.getTime() + PASSWORD_RECOVERY_TOKEN_TTL_MS);

  await createPasswordRecoveryToken({
    accountId: account.id,
    login: account.login,
    email: account.email,
    tokenHash: hashPasswordRecoveryToken(rawToken),
    requestedIp: input.ip ?? null,
    requestedUserAgent: input.userAgent ?? null,
    createdAt,
    expiresAt: toMysqlDateTime(expiresAt),
    consumedAt: null,
  });

  const resetUrl = buildPasswordRecoveryUrl(rawToken);
  const deliveryResult = await deliverPasswordRecoveryLink(
    {
      login: account.login,
      email: account.email,
      resetUrl,
      requestedAt: createdAt,
      requestedIp: input.ip ?? null,
      requestedUserAgent: input.userAgent ?? null,
    },
    deliveryConfig,
  );

  await createAuthAuditLogEntry({
    eventType: PASSWORD_RECOVERY_REQUEST_EVENT_TYPE,
    login: account.login,
    accountId: account.id,
    ip: input.ip ?? null,
    userAgent: input.userAgent ?? null,
    success: 1,
    detail: buildRecoveryAuditDetail({
      outcome: "token_created",
      deliveryMode: deliveryConfig.mode,
    }),
    createdAt,
  });

  return {
    ok: true,
    message: genericMessage,
    previewResetUrl: deliveryResult.previewResetUrl,
  };
}

export async function resetPasswordWithRecoveryToken(
  input: PasswordResetInput,
  locale: Locale = defaultLocale,
): Promise<ResetPasswordWithRecoveryTokenResult> {
  const resetAttemptedAt = toMysqlDateTime(new Date());
  const tokenHash = hashPasswordRecoveryToken(input.token);
  const recoveryToken = await findActivePasswordRecoveryTokenByHash(
    tokenHash,
    resetAttemptedAt,
  );
  const serverMessages = getMessages(locale).serverMessages;

  if (!recoveryToken) {
    await createAuthAuditLogEntry({
      eventType: PASSWORD_RECOVERY_RESET_EVENT_TYPE,
      login: "",
      accountId: null,
      ip: null,
      userAgent: null,
      success: 0,
      detail: buildRecoveryAuditDetail({
        outcome: "invalid_or_expired_token",
      }),
      createdAt: resetAttemptedAt,
    });

    return {
      ok: false,
      code: "invalid_or_expired_token",
      message: serverMessages.recoveryInvalidOrExpired,
      fieldErrors: {
        token: [serverMessages.recoveryInvalidOrExpired],
      },
    };
  }

  const passwordHash = await hashPasswordWithLegacyAlgorithm(input.password);
  const consumedAt = toMysqlDateTime(new Date());

  await updateLegacyAccountPassword(recoveryToken.accountId, passwordHash);
  await consumePasswordRecoveryToken(recoveryToken.id, consumedAt);
  await revokeSessionsForAccount(recoveryToken.accountId);
  await createAuthAuditLogEntry({
    eventType: PASSWORD_RECOVERY_RESET_EVENT_TYPE,
    login: recoveryToken.login,
    accountId: recoveryToken.accountId,
    ip: null,
    userAgent: null,
    success: 1,
    detail: buildRecoveryAuditDetail({
      outcome: "password_updated",
    }),
    createdAt: consumedAt,
  });

  return {
    ok: true,
    message: serverMessages.recoveryPasswordUpdatedSuccess,
  };
}
