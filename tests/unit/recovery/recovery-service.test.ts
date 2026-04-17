import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  findAccountByLoginMock,
  updateLegacyAccountPasswordMock,
  createPasswordRecoveryTokenMock,
  findActivePasswordRecoveryTokenByHashMock,
  consumePasswordRecoveryTokenMock,
  revokeSessionsForAccountMock,
  hashPasswordWithLegacyAlgorithmMock,
} = vi.hoisted(() => ({
  findAccountByLoginMock: vi.fn(),
  updateLegacyAccountPasswordMock: vi.fn(),
  createPasswordRecoveryTokenMock: vi.fn(),
  findActivePasswordRecoveryTokenByHashMock: vi.fn(),
  consumePasswordRecoveryTokenMock: vi.fn(),
  revokeSessionsForAccountMock: vi.fn(),
  hashPasswordWithLegacyAlgorithmMock: vi.fn(),
}));

vi.mock("@/server/account/account-repository", () => ({
  findAccountByLogin: findAccountByLoginMock,
  updateLegacyAccountPassword: updateLegacyAccountPasswordMock,
}));

vi.mock("@/server/recovery/recovery-repository", () => ({
  createPasswordRecoveryToken: createPasswordRecoveryTokenMock,
  findActivePasswordRecoveryTokenByHash: findActivePasswordRecoveryTokenByHashMock,
  consumePasswordRecoveryToken: consumePasswordRecoveryTokenMock,
}));

vi.mock("@/server/session/session-service", () => ({
  revokeSessionsForAccount: revokeSessionsForAccountMock,
}));

vi.mock("@/server/auth/password-compat", () => ({
  hashPasswordWithLegacyAlgorithm: hashPasswordWithLegacyAlgorithmMock,
}));

import {
  hashPasswordRecoveryToken,
  requestPasswordRecovery,
  resetPasswordWithRecoveryToken,
} from "@/server/recovery/recovery-service";

describe("recovery service", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  beforeEach(() => {
    vi.stubEnv("APP_BASE_URL", "http://localhost:3000");
    vi.stubEnv("NODE_ENV", "test");
    findAccountByLoginMock.mockReset();
    updateLegacyAccountPasswordMock.mockReset();
    createPasswordRecoveryTokenMock.mockReset();
    findActivePasswordRecoveryTokenByHashMock.mockReset();
    consumePasswordRecoveryTokenMock.mockReset();
    revokeSessionsForAccountMock.mockReset();
    hashPasswordWithLegacyAlgorithmMock.mockReset();
  });

  it("returns a generic success result when the account does not exist", async () => {
    findAccountByLoginMock.mockResolvedValueOnce(null);

    const result = await requestPasswordRecovery({
      login: "tester01",
      email: "tester@example.com",
    });

    expect(result.ok).toBe(true);
    expect(result.previewResetUrl).toBeUndefined();
    expect(createPasswordRecoveryTokenMock).not.toHaveBeenCalled();
  });

  it("creates a reset token when login and email match", async () => {
    findAccountByLoginMock.mockResolvedValueOnce({
      id: 7,
      login: "tester01",
      email: "tester@example.com",
      status: "OK",
    });

    const result = await requestPasswordRecovery({
      login: "tester01",
      email: "tester@example.com",
      ip: "127.0.0.1",
      userAgent: "Vitest",
    });

    expect(result.ok).toBe(true);
    expect(result.previewResetUrl).toMatch(
      /^http:\/\/localhost:3000\/reset-password\?token=[a-f0-9]{64}$/,
    );
    expect(createPasswordRecoveryTokenMock).toHaveBeenCalledWith(
      expect.objectContaining({
        accountId: 7,
        login: "tester01",
        email: "tester@example.com",
        tokenHash: expect.stringMatching(/^[a-f0-9]{64}$/),
      }),
    );
  });

  it("rejects an invalid or expired token", async () => {
    findActivePasswordRecoveryTokenByHashMock.mockResolvedValueOnce(null);

    await expect(
      resetPasswordWithRecoveryToken({
        token: "a".repeat(64),
        password: "abc12345",
        passwordConfirmation: "abc12345",
      }),
    ).resolves.toMatchObject({ ok: false, code: "invalid_or_expired_token" });
  });

  it("updates the password, consumes the token, and revokes sessions", async () => {
    const rawToken = "a".repeat(64);
    findActivePasswordRecoveryTokenByHashMock.mockResolvedValueOnce({
      id: 10,
      accountId: 7,
      login: "tester01",
      email: "tester@example.com",
      tokenHash: hashPasswordRecoveryToken(rawToken),
      createdAt: "2026-04-17 15:00:00",
      expiresAt: "2026-04-17 16:00:00",
      consumedAt: null,
      requestedIp: null,
      requestedUserAgent: null,
    });
    hashPasswordWithLegacyAlgorithmMock.mockResolvedValueOnce(
      "*BFDD8499E2AE949440E4DDBF1115D4A41471FE75",
    );

    await expect(
      resetPasswordWithRecoveryToken({
        token: rawToken,
        password: "abc12345",
        passwordConfirmation: "abc12345",
      }),
    ).resolves.toMatchObject({ ok: true });

    expect(updateLegacyAccountPasswordMock).toHaveBeenCalledWith(
      7,
      "*BFDD8499E2AE949440E4DDBF1115D4A41471FE75",
    );
    expect(consumePasswordRecoveryTokenMock).toHaveBeenCalledWith(
      10,
      expect.any(String),
    );
    expect(revokeSessionsForAccountMock).toHaveBeenCalledWith(7);
  });
});
