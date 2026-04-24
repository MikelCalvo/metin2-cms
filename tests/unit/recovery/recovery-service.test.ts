import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  findAccountByLoginMock,
  updateLegacyAccountPasswordMock,
  createPasswordRecoveryTokenMock,
  findActivePasswordRecoveryTokenByHashMock,
  consumePasswordRecoveryTokenMock,
  revokeSessionsForAccountMock,
  hashPasswordWithLegacyAlgorithmMock,
  deliverPasswordRecoveryLinkMock,
  getRecoveryDeliveryConfigMock,
  createAuthAuditLogEntryMock,
  countAuthAuditEntriesSinceMock,
} = vi.hoisted(() => ({
  findAccountByLoginMock: vi.fn(),
  updateLegacyAccountPasswordMock: vi.fn(),
  createPasswordRecoveryTokenMock: vi.fn(),
  findActivePasswordRecoveryTokenByHashMock: vi.fn(),
  consumePasswordRecoveryTokenMock: vi.fn(),
  revokeSessionsForAccountMock: vi.fn(),
  hashPasswordWithLegacyAlgorithmMock: vi.fn(),
  deliverPasswordRecoveryLinkMock: vi.fn(),
  getRecoveryDeliveryConfigMock: vi.fn(),
  createAuthAuditLogEntryMock: vi.fn(),
  countAuthAuditEntriesSinceMock: vi.fn(),
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

vi.mock("@/server/auth/auth-audit-repository", () => ({
  createAuthAuditLogEntry: createAuthAuditLogEntryMock,
  countAuthAuditEntriesSince: countAuthAuditEntriesSinceMock,
}));

vi.mock("@/server/recovery/recovery-delivery", () => ({
  deliverPasswordRecoveryLink: deliverPasswordRecoveryLinkMock,
  getRecoveryDeliveryConfig: getRecoveryDeliveryConfigMock,
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
    vi.stubEnv("DATABASE_URL", "mysql://test:test@127.0.0.1:3306/account_test");
    vi.stubEnv("CMS_DATABASE_URL", "mysql://test:test@127.0.0.1:3306/metin2_cms_test");
    vi.stubEnv("NODE_ENV", "test");
    findAccountByLoginMock.mockReset();
    updateLegacyAccountPasswordMock.mockReset();
    createPasswordRecoveryTokenMock.mockReset();
    findActivePasswordRecoveryTokenByHashMock.mockReset();
    consumePasswordRecoveryTokenMock.mockReset();
    revokeSessionsForAccountMock.mockReset();
    hashPasswordWithLegacyAlgorithmMock.mockReset();
    deliverPasswordRecoveryLinkMock.mockReset();
    getRecoveryDeliveryConfigMock.mockReset();
    createAuthAuditLogEntryMock.mockReset();
    countAuthAuditEntriesSinceMock.mockReset();
    getRecoveryDeliveryConfigMock.mockReturnValue({
      mode: "preview",
      outboxDir: "/tmp/metin2-cms-recovery-outbox",
    });
    countAuthAuditEntriesSinceMock.mockResolvedValue(0);
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
    expect(deliverPasswordRecoveryLinkMock).not.toHaveBeenCalled();
    expect(createAuthAuditLogEntryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "password_recovery.request",
        login: "tester01",
        success: 0,
        detail: expect.stringContaining("login_email_mismatch_or_unavailable"),
      }),
    );
  });

  it("creates a reset token when login and email match", async () => {
    findAccountByLoginMock.mockResolvedValueOnce({
      id: 7,
      login: "tester01",
      email: "tester@example.com",
      status: "OK",
    });
    deliverPasswordRecoveryLinkMock.mockResolvedValueOnce({
      previewResetUrl: "http://localhost:3000/reset-password?token=preview-token",
    });

    const result = await requestPasswordRecovery({
      login: "tester01",
      email: "tester@example.com",
      ip: "127.0.0.1",
      userAgent: "Vitest",
    });

    expect(result.ok).toBe(true);
    expect(result.previewResetUrl).toBe(
      "http://localhost:3000/reset-password?token=preview-token",
    );
    expect(createPasswordRecoveryTokenMock).toHaveBeenCalledWith(
      expect.objectContaining({
        accountId: 7,
        login: "tester01",
        email: "tester@example.com",
        tokenHash: expect.stringMatching(/^[a-f0-9]{64}$/),
      }),
    );
    expect(deliverPasswordRecoveryLinkMock).toHaveBeenCalledWith(
      expect.objectContaining({
        login: "tester01",
        email: "tester@example.com",
        resetUrl: expect.stringMatching(
          /^http:\/\/localhost:3000\/reset-password\?token=[a-f0-9]{64}$/,
        ),
        requestedIp: "127.0.0.1",
        requestedUserAgent: "Vitest",
      }),
      expect.objectContaining({
        mode: "preview",
        outboxDir: "/tmp/metin2-cms-recovery-outbox",
      }),
    );
    expect(countAuthAuditEntriesSinceMock).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "password_recovery.request",
        login: "tester01",
      }),
    );
    expect(createAuthAuditLogEntryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "password_recovery.request",
        login: "tester01",
        accountId: 7,
        success: 1,
        detail: expect.stringContaining("token_created"),
      }),
    );
  });

  it("normalizes recovery request metadata before writing tokens and audit rows", async () => {
    findAccountByLoginMock.mockResolvedValueOnce({
      id: 7,
      login: "tester01",
      email: "tester@example.com",
      status: "OK",
    });
    deliverPasswordRecoveryLinkMock.mockResolvedValueOnce({
      previewResetUrl: "http://localhost:3000/reset-password?token=preview-token",
    });

    await requestPasswordRecovery({
      login: "tester01",
      email: "tester@example.com",
      ip: " \u0000203.0.113.9 , 10.0.0.1\r\n",
      userAgent: `\u0000Vitest\r\nBrowser\t${"x".repeat(600)}`,
    });

    const recoveryToken = createPasswordRecoveryTokenMock.mock.calls[0]?.[0];
    const deliveryPayload = deliverPasswordRecoveryLinkMock.mock.calls[0]?.[0];
    const auditEntry = createAuthAuditLogEntryMock.mock.calls.at(-1)?.[0];

    expect(recoveryToken).toBeDefined();
    expect(recoveryToken.requestedIp).toBe("203.0.113.9");
    expect(recoveryToken.requestedUserAgent).toHaveLength(512);
    expect(recoveryToken.requestedUserAgent).toMatch(/^Vitest Browser x+$/);

    expect(deliveryPayload).toBeDefined();
    expect(deliveryPayload.requestedIp).toBe("203.0.113.9");
    expect(deliveryPayload.requestedUserAgent).toHaveLength(512);
    expect(deliveryPayload.requestedUserAgent).toMatch(/^Vitest Browser x+$/);

    expect(auditEntry).toBeDefined();
    expect(auditEntry.ip).toBe("203.0.113.9");
    expect(auditEntry.userAgent).toHaveLength(512);
    expect(auditEntry.userAgent).toMatch(/^Vitest Browser x+$/);
  });

  it("uses a manual-delivery message in file mode", async () => {
    getRecoveryDeliveryConfigMock.mockReturnValueOnce({
      mode: "file",
      outboxDir: "/tmp/metin2-cms-recovery-outbox",
    });
    findAccountByLoginMock.mockResolvedValueOnce(null);

    const result = await requestPasswordRecovery({
      login: "tester01",
      email: "tester@example.com",
    });

    expect(result.ok).toBe(true);
    expect(result.message).toBe(
      "If the login and email match an account, the recovery request has been queued for manual delivery.",
    );
  });

  it("rate limits repeated recovery requests before creating a token", async () => {
    countAuthAuditEntriesSinceMock.mockResolvedValueOnce(3);

    const result = await requestPasswordRecovery({
      login: "tester01",
      email: "tester@example.com",
      ip: "127.0.0.1",
      userAgent: "Vitest",
    });

    expect(result.ok).toBe(true);
    expect(result.previewResetUrl).toBeUndefined();
    expect(findAccountByLoginMock).not.toHaveBeenCalled();
    expect(createPasswordRecoveryTokenMock).not.toHaveBeenCalled();
    expect(deliverPasswordRecoveryLinkMock).not.toHaveBeenCalled();
    expect(createAuthAuditLogEntryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "password_recovery.request",
        login: "tester01",
        success: 0,
        detail: expect.stringContaining("rate_limited"),
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

    expect(createAuthAuditLogEntryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "password_recovery.reset",
        login: "",
        success: 0,
        detail: expect.stringContaining("invalid_or_expired_token"),
      }),
    );
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
    expect(createAuthAuditLogEntryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "password_recovery.reset",
        login: "tester01",
        accountId: 7,
        success: 1,
        detail: expect.stringContaining("password_updated"),
      }),
    );
  });
});
