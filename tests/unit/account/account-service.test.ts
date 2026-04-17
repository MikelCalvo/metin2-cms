import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  findAccountByLoginMock,
  createLegacyAccountMock,
  hashPasswordWithLegacyAlgorithmMock,
  verifyLegacyPasswordMock,
  createAuthAuditLogEntryMock,
  countAuthAuditEntriesSinceMock,
} = vi.hoisted(() => ({
  findAccountByLoginMock: vi.fn(),
  createLegacyAccountMock: vi.fn(),
  hashPasswordWithLegacyAlgorithmMock: vi.fn(),
  verifyLegacyPasswordMock: vi.fn(),
  createAuthAuditLogEntryMock: vi.fn(),
  countAuthAuditEntriesSinceMock: vi.fn(),
}));

vi.mock("@/server/account/account-repository", () => ({
  findAccountByLogin: findAccountByLoginMock,
  createLegacyAccount: createLegacyAccountMock,
}));

vi.mock("@/server/auth/password-compat", () => ({
  hashPasswordWithLegacyAlgorithm: hashPasswordWithLegacyAlgorithmMock,
  verifyLegacyPassword: verifyLegacyPasswordMock,
}));

vi.mock("@/server/auth/auth-audit-repository", () => ({
  createAuthAuditLogEntry: createAuthAuditLogEntryMock,
  countAuthAuditEntriesSince: countAuthAuditEntriesSinceMock,
}));

import {
  authenticateLegacyAccount,
  registerLegacyCompatibleAccount,
} from "@/server/account/account-service";

describe("account service", () => {
  beforeEach(() => {
    findAccountByLoginMock.mockReset();
    createLegacyAccountMock.mockReset();
    hashPasswordWithLegacyAlgorithmMock.mockReset();
    verifyLegacyPasswordMock.mockReset();
    createAuthAuditLogEntryMock.mockReset();
    countAuthAuditEntriesSinceMock.mockReset();
    countAuthAuditEntriesSinceMock.mockResolvedValue(0);
  });

  it("rejects login when the account does not exist", async () => {
    findAccountByLoginMock.mockResolvedValueOnce(null);

    await expect(
      authenticateLegacyAccount({ login: "tester01", password: "abc12345" }),
    ).resolves.toMatchObject({ ok: false, code: "invalid_credentials" });

    expect(createAuthAuditLogEntryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "login",
        login: "tester01",
        success: 0,
        detail: expect.stringContaining("invalid_credentials"),
      }),
    );
  });

  it("rejects login when the password is invalid", async () => {
    findAccountByLoginMock.mockResolvedValueOnce({
      id: 1,
      login: "tester01",
      password: "*BFDD8499E2AE949440E4DDBF1115D4A41471FE75",
      status: "OK",
    });
    verifyLegacyPasswordMock.mockResolvedValueOnce(false);

    await expect(
      authenticateLegacyAccount({ login: "tester01", password: "abc12345" }),
    ).resolves.toMatchObject({ ok: false, code: "invalid_credentials" });

    expect(createAuthAuditLogEntryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "login",
        login: "tester01",
        accountId: 1,
        success: 0,
        detail: expect.stringContaining("invalid_credentials"),
      }),
    );
  });

  it("rejects login when the account status is not usable", async () => {
    findAccountByLoginMock.mockResolvedValueOnce({
      id: 1,
      login: "tester01",
      password: "*BFDD8499E2AE949440E4DDBF1115D4A41471FE75",
      status: "BLOCK",
    });
    verifyLegacyPasswordMock.mockResolvedValueOnce(true);

    await expect(
      authenticateLegacyAccount({ login: "tester01", password: "abc12345" }),
    ).resolves.toMatchObject({ ok: false, code: "account_unavailable" });

    expect(createAuthAuditLogEntryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "login",
        login: "tester01",
        accountId: 1,
        success: 0,
        detail: expect.stringContaining("account_unavailable"),
      }),
    );
  });

  it("returns the account when credentials are valid", async () => {
    findAccountByLoginMock.mockResolvedValueOnce({
      id: 1,
      login: "tester01",
      password: "*BFDD8499E2AE949440E4DDBF1115D4A41471FE75",
      status: "OK",
      email: "tester@example.com",
      socialId: "1234567",
      cash: 0,
      mileage: 0,
    });
    verifyLegacyPasswordMock.mockResolvedValueOnce(true);

    await expect(
      authenticateLegacyAccount({ login: "tester01", password: "abc12345" }),
    ).resolves.toMatchObject({ ok: true, account: { login: "tester01" } });

    expect(createAuthAuditLogEntryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "login",
        login: "tester01",
        accountId: 1,
        success: 1,
        detail: expect.stringContaining("authenticated"),
      }),
    );
  });

  it("rate limits login after repeated failed attempts for the same login", async () => {
    countAuthAuditEntriesSinceMock.mockResolvedValueOnce(5);

    await expect(
      authenticateLegacyAccount({
        login: "tester01",
        password: "abc12345",
        ip: "127.0.0.1",
        userAgent: "Vitest",
      }),
    ).resolves.toMatchObject({ ok: false, code: "rate_limited" });

    expect(findAccountByLoginMock).not.toHaveBeenCalled();
    expect(verifyLegacyPasswordMock).not.toHaveBeenCalled();
    expect(createAuthAuditLogEntryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "login",
        login: "tester01",
        success: 0,
        detail: expect.stringContaining("rate_limited"),
      }),
    );
  });

  it("rejects register when the login already exists", async () => {
    findAccountByLoginMock.mockResolvedValueOnce({ id: 1, login: "tester01" });

    await expect(
      registerLegacyCompatibleAccount({
        login: "tester01",
        email: "tester@example.com",
        password: "abc12345",
        passwordConfirmation: "abc12345",
        socialId: "1234567",
      }),
    ).resolves.toMatchObject({ ok: false, code: "login_taken" });
  });

  it("maps a duplicate-key insert race to login_taken", async () => {
    findAccountByLoginMock.mockResolvedValueOnce(null);
    createLegacyAccountMock.mockRejectedValueOnce({
      code: "ER_DUP_ENTRY",
    });
    hashPasswordWithLegacyAlgorithmMock.mockResolvedValueOnce(
      "*BFDD8499E2AE949440E4DDBF1115D4A41471FE75",
    );

    await expect(
      registerLegacyCompatibleAccount({
        login: "tester01",
        email: "tester@example.com",
        password: "abc12345",
        passwordConfirmation: "abc12345",
        socialId: "1234567",
      }),
    ).resolves.toMatchObject({ ok: false, code: "login_taken" });
  });

  it("creates a new legacy-compatible account", async () => {
    findAccountByLoginMock.mockResolvedValueOnce(null).mockResolvedValueOnce({
      id: 7,
      login: "tester01",
      email: "tester@example.com",
      socialId: "1234567",
      status: "OK",
      password: "*BFDD8499E2AE949440E4DDBF1115D4A41471FE75",
      cash: 0,
      mileage: 0,
    });
    hashPasswordWithLegacyAlgorithmMock.mockResolvedValueOnce(
      "*BFDD8499E2AE949440E4DDBF1115D4A41471FE75",
    );

    await expect(
      registerLegacyCompatibleAccount({
        login: "tester01",
        email: "tester@example.com",
        password: "abc12345",
        passwordConfirmation: "abc12345",
        socialId: "1234567",
      }),
    ).resolves.toMatchObject({ ok: true, account: { login: "tester01" } });

    expect(createLegacyAccountMock).toHaveBeenCalledWith(
      expect.objectContaining({
        login: "tester01",
        email: "tester@example.com",
        socialId: "1234567",
        status: "OK",
        password: "*BFDD8499E2AE949440E4DDBF1115D4A41471FE75",
      }),
    );
  });
});
