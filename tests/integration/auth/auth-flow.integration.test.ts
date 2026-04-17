import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { closeDbPools } from "@/lib/db/connection";
import { findAccountByLogin } from "@/server/account/account-repository";
import {
  authenticateLegacyAccount,
  registerLegacyCompatibleAccount,
} from "@/server/account/account-service";
import { isLegacyPasswordHash } from "@/server/auth/password-compat";
import {
  createWebSession,
  findActiveSessionById,
} from "@/server/session/session-repository";

import {
  assertIntegrationEnv,
  createLogin,
  resetIntegrationTables,
  toMysqlDateTime,
} from "../helpers/db";

assertIntegrationEnv();

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
});
