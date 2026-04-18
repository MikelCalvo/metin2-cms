import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  findAccountByIdMock,
  updateLegacyAccountPasswordMock,
  verifyLegacyPasswordMock,
  hashPasswordWithLegacyAlgorithmMock,
  createAuthAuditLogEntryMock,
  revokeOtherSessionsForAccountMock,
} = vi.hoisted(() => ({
  findAccountByIdMock: vi.fn(),
  updateLegacyAccountPasswordMock: vi.fn(),
  verifyLegacyPasswordMock: vi.fn(),
  hashPasswordWithLegacyAlgorithmMock: vi.fn(),
  createAuthAuditLogEntryMock: vi.fn(),
  revokeOtherSessionsForAccountMock: vi.fn(),
}));

vi.mock("@/server/account/account-repository", () => ({
  findAccountById: findAccountByIdMock,
  updateLegacyAccountPassword: updateLegacyAccountPasswordMock,
}));

vi.mock("@/server/auth/password-compat", () => ({
  verifyLegacyPassword: verifyLegacyPasswordMock,
  hashPasswordWithLegacyAlgorithm: hashPasswordWithLegacyAlgorithmMock,
}));

vi.mock("@/server/auth/auth-audit-repository", () => ({
  createAuthAuditLogEntry: createAuthAuditLogEntryMock,
}));

vi.mock("@/server/session/session-service", () => ({
  revokeOtherSessionsForAccount: revokeOtherSessionsForAccountMock,
}));

import { changeAuthenticatedAccountPassword } from "@/server/account/account-settings-service";

describe("account settings service", () => {
  beforeEach(() => {
    findAccountByIdMock.mockReset();
    updateLegacyAccountPasswordMock.mockReset();
    verifyLegacyPasswordMock.mockReset();
    hashPasswordWithLegacyAlgorithmMock.mockReset();
    createAuthAuditLogEntryMock.mockReset();
    revokeOtherSessionsForAccountMock.mockReset();
  });

  it("changes the password for an authenticated account and revokes the other sessions", async () => {
    findAccountByIdMock.mockResolvedValueOnce({
      id: 7,
      login: "tester01",
      password: "legacy-hash",
      status: "OK",
    });
    verifyLegacyPasswordMock.mockResolvedValueOnce(true);
    hashPasswordWithLegacyAlgorithmMock.mockResolvedValueOnce("new-legacy-hash");

    await expect(
      changeAuthenticatedAccountPassword({
        accountId: 7,
        login: "tester01",
        currentSessionId: "session-current",
        currentPassword: "abc12345",
        newPassword: "newpass12",
        ip: "127.0.0.1",
        userAgent: "Vitest",
      }),
    ).resolves.toMatchObject({
      ok: true,
      message: "Password updated successfully.",
    });

    expect(updateLegacyAccountPasswordMock).toHaveBeenCalledWith(7, "new-legacy-hash");
    expect(revokeOtherSessionsForAccountMock).toHaveBeenCalledWith(7, "session-current");
    expect(createAuthAuditLogEntryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "account.password_change",
        login: "tester01",
        accountId: 7,
        success: 1,
        detail: expect.stringContaining("password_updated"),
      }),
    );
  });

  it("rejects the change when the current password is invalid", async () => {
    findAccountByIdMock.mockResolvedValueOnce({
      id: 7,
      login: "tester01",
      password: "legacy-hash",
      status: "OK",
    });
    verifyLegacyPasswordMock.mockResolvedValueOnce(false);

    await expect(
      changeAuthenticatedAccountPassword({
        accountId: 7,
        login: "tester01",
        currentSessionId: "session-current",
        currentPassword: "wrongpass1",
        newPassword: "newpass12",
        ip: "127.0.0.1",
        userAgent: "Vitest",
      }),
    ).resolves.toMatchObject({
      ok: false,
      code: "invalid_current_password",
      fieldErrors: {
        currentPassword: ["Current password is incorrect."],
      },
    });

    expect(updateLegacyAccountPasswordMock).not.toHaveBeenCalled();
    expect(revokeOtherSessionsForAccountMock).not.toHaveBeenCalled();
    expect(createAuthAuditLogEntryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "account.password_change",
        login: "tester01",
        accountId: 7,
        success: 0,
        detail: expect.stringContaining("invalid_current_password"),
      }),
    );
  });
});
