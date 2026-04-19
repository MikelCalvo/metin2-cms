import "server-only";

import { defaultLocale, type Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import type { NewLegacyAccount } from "@/lib/db/schema/account";
import {
  createLegacyAccount,
  findAccountByLogin,
} from "@/server/account/account-repository";
import {
  countAuthAuditEntriesSince,
  createAuthAuditLogEntry,
} from "@/server/auth/auth-audit-repository";
import {
  hashPasswordWithLegacyAlgorithm,
  verifyLegacyPassword,
} from "@/server/auth/password-compat";
import type {
  AuthenticateLegacyAccountResult,
  LoginInput,
  RegisterInput,
  RegisterLegacyCompatibleAccountResult,
} from "@/server/auth/types";

function toMysqlDateTime(date: Date) {
  return date.toISOString().slice(0, 19).replace("T", " ");
}

const LOGIN_AUDIT_EVENT_TYPE = "login";
const LOGIN_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_RATE_LIMIT_MAX_FAILURES = 5;

function buildLoginAuditDetail(outcome: string) {
  return `outcome=${outcome}`;
}

export async function authenticateLegacyAccount(
  input: LoginInput,
  locale: Locale = defaultLocale,
): Promise<AuthenticateLegacyAccountResult> {
  const attemptedAt = new Date();
  const createdAt = toMysqlDateTime(attemptedAt);
  const recentFailureWindowStartedAt = toMysqlDateTime(
    new Date(attemptedAt.getTime() - LOGIN_RATE_LIMIT_WINDOW_MS),
  );
  const recentFailedAttempts = await countAuthAuditEntriesSince({
    eventType: LOGIN_AUDIT_EVENT_TYPE,
    login: input.login,
    since: recentFailureWindowStartedAt,
    success: 0,
  });
  const serverMessages = getMessages(locale).serverMessages;

  if (recentFailedAttempts >= LOGIN_RATE_LIMIT_MAX_FAILURES) {
    await createAuthAuditLogEntry({
      eventType: LOGIN_AUDIT_EVENT_TYPE,
      login: input.login,
      accountId: null,
      ip: input.ip ?? null,
      userAgent: input.userAgent ?? null,
      success: 0,
      detail: buildLoginAuditDetail("rate_limited"),
      createdAt,
    });

    return {
      ok: false,
      code: "rate_limited",
      message: serverMessages.tooManySignInAttempts,
    };
  }

  const account = await findAccountByLogin(input.login);

  if (!account) {
    await createAuthAuditLogEntry({
      eventType: LOGIN_AUDIT_EVENT_TYPE,
      login: input.login,
      accountId: null,
      ip: input.ip ?? null,
      userAgent: input.userAgent ?? null,
      success: 0,
      detail: buildLoginAuditDetail("invalid_credentials"),
      createdAt,
    });

    return {
      ok: false,
      code: "invalid_credentials",
      message: serverMessages.invalidCredentials,
    };
  }

  const passwordMatches = await verifyLegacyPassword(input.password, account.password);

  if (!passwordMatches) {
    await createAuthAuditLogEntry({
      eventType: LOGIN_AUDIT_EVENT_TYPE,
      login: input.login,
      accountId: account.id,
      ip: input.ip ?? null,
      userAgent: input.userAgent ?? null,
      success: 0,
      detail: buildLoginAuditDetail("invalid_credentials"),
      createdAt,
    });

    return {
      ok: false,
      code: "invalid_credentials",
      message: serverMessages.invalidCredentials,
    };
  }

  if (account.status !== "OK") {
    await createAuthAuditLogEntry({
      eventType: LOGIN_AUDIT_EVENT_TYPE,
      login: input.login,
      accountId: account.id,
      ip: input.ip ?? null,
      userAgent: input.userAgent ?? null,
      success: 0,
      detail: buildLoginAuditDetail("account_unavailable"),
      createdAt,
    });

    return {
      ok: false,
      code: "account_unavailable",
      message: serverMessages.accountUnavailableForLogin,
    };
  }

  await createAuthAuditLogEntry({
    eventType: LOGIN_AUDIT_EVENT_TYPE,
    login: input.login,
    accountId: account.id,
    ip: input.ip ?? null,
    userAgent: input.userAgent ?? null,
    success: 1,
    detail: buildLoginAuditDetail("authenticated"),
    createdAt,
  });

  return {
    ok: true,
    account,
  };
}

export async function registerLegacyCompatibleAccount(
  input: RegisterInput,
  locale: Locale = defaultLocale,
): Promise<RegisterLegacyCompatibleAccountResult> {
  const existingAccount = await findAccountByLogin(input.login);
  const serverMessages = getMessages(locale).serverMessages;

  if (existingAccount) {
    return {
      ok: false,
      code: "login_taken",
      message: serverMessages.loginTaken,
      fieldErrors: {
        login: [serverMessages.loginTaken],
      },
    };
  }

  const passwordHash = await hashPasswordWithLegacyAlgorithm(input.password);
  const now = toMysqlDateTime(new Date());
  const newAccount: NewLegacyAccount = {
    login: input.login,
    password: passwordHash,
    socialId: input.socialId,
    email: input.email,
    createTime: now,
    status: "OK",
  };

  try {
    await createLegacyAccount(newAccount);
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "ER_DUP_ENTRY"
    ) {
      return {
        ok: false,
        code: "login_taken",
        message: serverMessages.loginTaken,
        fieldErrors: {
          login: [serverMessages.loginTaken],
        },
      };
    }

    throw error;
  }

  const createdAccount = await findAccountByLogin(input.login);

  if (!createdAccount) {
    return {
      ok: false,
      code: "registration_failed",
      message: serverMessages.accountCreationFailed,
    };
  }

  return {
    ok: true,
    account: createdAccount,
  };
}
