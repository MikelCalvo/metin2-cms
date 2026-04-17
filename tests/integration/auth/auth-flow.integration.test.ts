import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { closeDbPools } from "@/lib/db/connection";
import { findAccountByLogin } from "@/server/account/account-repository";
import {
  authenticateLegacyAccount,
  registerLegacyCompatibleAccount,
} from "@/server/account/account-service";
import { isLegacyPasswordHash } from "@/server/auth/password-compat";
import {
  requestPasswordRecovery,
  resetPasswordWithRecoveryToken,
} from "@/server/recovery/recovery-service";
import {
  createWebSession,
  findActiveSessionById,
} from "@/server/session/session-repository";

import {
  assertIntegrationEnv,
  countPasswordRecoveryTokens,
  createLogin,
  listAuthAuditLogEntries,
  resetIntegrationTables,
  setLegacyAccountStatus,
  toMysqlDateTime,
} from "../helpers/db";

assertIntegrationEnv();

function extractTokenFromResetUrl(url: string) {
  return new URL(url).searchParams.get("token") ?? "";
}

describe("legacy auth flow against test MariaDB", () => {
  beforeEach(async () => {
    await resetIntegrationTables();
  });

  afterAll(async () => {
    await closeDbPools();
  });

  it("registers a new legacy-compatible account in account_test", async () => {
    const login = createLogin("reg");

    const result = await registerLegacyCompatibleAccount({
      login,
      email: `${login}@example.com`,
      password: "abc12345",
      passwordConfirmation: "abc12345",
      socialId: "1234567",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    const stored = await findAccountByLogin(login);

    expect(stored).not.toBeNull();
    expect(stored?.email).toBe(`${login}@example.com`);
    expect(stored?.socialId).toBe("1234567");
    expect(stored?.status).toBe("OK");
    expect(stored?.password).not.toBe("abc12345");
    expect(isLegacyPasswordHash(stored?.password ?? "")).toBe(true);
  });

  it("rejects duplicate logins against the legacy unique index", async () => {
    const login = createLogin("dup");

    const first = await registerLegacyCompatibleAccount({
      login,
      email: `${login}@example.com`,
      password: "abc12345",
      passwordConfirmation: "abc12345",
      socialId: "1234567",
    });

    expect(first.ok).toBe(true);

    const second = await registerLegacyCompatibleAccount({
      login,
      email: `${login}2@example.com`,
      password: "abc12345",
      passwordConfirmation: "abc12345",
      socialId: "7654321",
    });

    expect(second).toMatchObject({
      ok: false,
      code: "login_taken",
    });
  });

  it("rejects a bad password for an existing legacy account", async () => {
    const login = createLogin("bad");

    await registerLegacyCompatibleAccount({
      login,
      email: `${login}@example.com`,
      password: "abc12345",
      passwordConfirmation: "abc12345",
      socialId: "1234567",
    });

    const auth = await authenticateLegacyAccount({
      login,
      password: "wrongpass1",
    });

    expect(auth).toMatchObject({
      ok: false,
      code: "invalid_credentials",
    });
  });

  it("rejects a blocked account even when the password matches", async () => {
    const login = createLogin("blk");

    await registerLegacyCompatibleAccount({
      login,
      email: `${login}@example.com`,
      password: "abc12345",
      passwordConfirmation: "abc12345",
      socialId: "1234567",
    });
    await setLegacyAccountStatus(login, "BLOCK");

    const auth = await authenticateLegacyAccount({
      login,
      password: "abc12345",
    });

    expect(auth).toMatchObject({
      ok: false,
      code: "account_unavailable",
    });
  });

  it("authenticates a registered account and persists a CMS web session", async () => {
    const login = createLogin("login");

    const registration = await registerLegacyCompatibleAccount({
      login,
      email: `${login}@example.com`,
      password: "abc12345",
      passwordConfirmation: "abc12345",
      socialId: "7654321",
    });

    expect(registration.ok).toBe(true);
    if (!registration.ok) {
      return;
    }

    const auth = await authenticateLegacyAccount({
      login,
      password: "abc12345",
    });

    expect(auth.ok).toBe(true);
    if (!auth.ok) {
      return;
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 60_000);
    const sessionId = `${login}-session`;

    await createWebSession({
      id: sessionId,
      accountId: auth.account.id,
      login: auth.account.login,
      ip: "127.0.0.1",
      userAgent: "vitest-integration",
      createdAt: toMysqlDateTime(now),
      lastSeenAt: toMysqlDateTime(now),
      expiresAt: toMysqlDateTime(expiresAt),
      revokedAt: null,
    });

    const storedSession = await findActiveSessionById(
      sessionId,
      toMysqlDateTime(now),
    );

    expect(storedSession).not.toBeNull();
    expect(storedSession?.accountId).toBe(auth.account.id);
    expect(storedSession?.login).toBe(login);
  });

  it("creates and consumes a password recovery token against the test databases", async () => {
    const login = createLogin("rec");

    await registerLegacyCompatibleAccount({
      login,
      email: `${login}@example.com`,
      password: "abc12345",
      passwordConfirmation: "abc12345",
      socialId: "1234567",
    });

    const request = await requestPasswordRecovery({
      login,
      email: `${login}@example.com`,
      ip: "127.0.0.1",
      userAgent: "vitest-integration",
    });

    expect(request.ok).toBe(true);
    expect(request.previewResetUrl).toBeTruthy();
    expect(await countPasswordRecoveryTokens(login)).toBe(1);

    const token = extractTokenFromResetUrl(request.previewResetUrl ?? "");
    expect(token).toHaveLength(64);

    const reset = await resetPasswordWithRecoveryToken({
      token,
      password: "newpass12",
      passwordConfirmation: "newpass12",
    });

    expect(reset).toMatchObject({ ok: true });

    const oldPasswordAuth = await authenticateLegacyAccount({
      login,
      password: "abc12345",
    });
    const newPasswordAuth = await authenticateLegacyAccount({
      login,
      password: "newpass12",
    });

    expect(oldPasswordAuth).toMatchObject({
      ok: false,
      code: "invalid_credentials",
    });
    expect(newPasswordAuth).toMatchObject({ ok: true });
  });

  it("writes auth audit rows for recovery request and reset flows", async () => {
    const login = createLogin("audit");

    await registerLegacyCompatibleAccount({
      login,
      email: `${login}@example.com`,
      password: "abc12345",
      passwordConfirmation: "abc12345",
      socialId: "1234567",
    });

    const request = await requestPasswordRecovery({
      login,
      email: `${login}@example.com`,
      ip: "127.0.0.1",
      userAgent: "vitest-integration",
    });

    expect(request.ok).toBe(true);
    expect(request.previewResetUrl).toBeTruthy();

    const token = extractTokenFromResetUrl(request.previewResetUrl ?? "");
    expect(token).toHaveLength(64);

    const reset = await resetPasswordWithRecoveryToken({
      token,
      password: "newpass12",
      passwordConfirmation: "newpass12",
    });

    expect(reset).toMatchObject({ ok: true });

    const auditEntries = await listAuthAuditLogEntries(login);

    expect(auditEntries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          eventType: "password_recovery.request",
          login,
          success: 1,
        }),
        expect.objectContaining({
          eventType: "password_recovery.reset",
          login,
          success: 1,
        }),
      ]),
    );
  });

  it("rate limits repeated recovery requests for the same login", async () => {
    const login = createLogin("limit");

    await registerLegacyCompatibleAccount({
      login,
      email: `${login}@example.com`,
      password: "abc12345",
      passwordConfirmation: "abc12345",
      socialId: "1234567",
    });

    const first = await requestPasswordRecovery({
      login,
      email: `${login}@example.com`,
      ip: "127.0.0.1",
      userAgent: "vitest-integration",
    });
    const second = await requestPasswordRecovery({
      login,
      email: `${login}@example.com`,
      ip: "127.0.0.1",
      userAgent: "vitest-integration",
    });
    const third = await requestPasswordRecovery({
      login,
      email: `${login}@example.com`,
      ip: "127.0.0.1",
      userAgent: "vitest-integration",
    });
    const fourth = await requestPasswordRecovery({
      login,
      email: `${login}@example.com`,
      ip: "127.0.0.1",
      userAgent: "vitest-integration",
    });

    expect(first.previewResetUrl).toBeTruthy();
    expect(second.previewResetUrl).toBeTruthy();
    expect(third.previewResetUrl).toBeTruthy();
    expect(fourth.previewResetUrl).toBeUndefined();
    expect(await countPasswordRecoveryTokens(login)).toBe(3);

    const auditEntries = await listAuthAuditLogEntries(login);
    expect(auditEntries).toHaveLength(4);
    expect(auditEntries.at(-1)).toEqual(
      expect.objectContaining({
        eventType: "password_recovery.request",
        login,
        success: 0,
        detail: expect.stringContaining("rate_limited"),
      }),
    );
  });
});
