import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getCurrentAuthenticatedSessionMock,
  revokeSessionByIdMock,
  findAccountByIdMock,
} = vi.hoisted(() => ({
  getCurrentAuthenticatedSessionMock: vi.fn(),
  revokeSessionByIdMock: vi.fn(),
  findAccountByIdMock: vi.fn(),
}));

vi.mock("@/server/session/session-service", () => ({
  getCurrentAuthenticatedSession: getCurrentAuthenticatedSessionMock,
  revokeSessionById: revokeSessionByIdMock,
}));

vi.mock("@/server/account/account-repository", () => ({
  findAccountById: findAccountByIdMock,
}));

import { getCurrentAuthenticatedAccount } from "@/server/auth/current-account";

describe("current authenticated account guard", () => {
  beforeEach(() => {
    getCurrentAuthenticatedSessionMock.mockReset();
    revokeSessionByIdMock.mockReset();
    findAccountByIdMock.mockReset();
  });

  it("returns null when there is no current session", async () => {
    getCurrentAuthenticatedSessionMock.mockResolvedValueOnce(null);

    await expect(getCurrentAuthenticatedAccount()).resolves.toBeNull();
  });

  it("revokes the session when the account no longer exists", async () => {
    getCurrentAuthenticatedSessionMock.mockResolvedValueOnce({
      id: "session-test-id",
      accountId: 7,
    });
    findAccountByIdMock.mockResolvedValueOnce(null);

    await expect(getCurrentAuthenticatedAccount()).resolves.toBeNull();
    expect(revokeSessionByIdMock).toHaveBeenCalledWith("session-test-id");
  });

  it("revokes the session when the account is not usable", async () => {
    getCurrentAuthenticatedSessionMock.mockResolvedValueOnce({
      id: "session-test-id",
      accountId: 7,
    });
    findAccountByIdMock.mockResolvedValueOnce({
      id: 7,
      login: "tester01",
      status: "BLOCK",
    });

    await expect(getCurrentAuthenticatedAccount()).resolves.toBeNull();
    expect(revokeSessionByIdMock).toHaveBeenCalledWith("session-test-id");
  });

  it("returns the session and account when both are valid", async () => {
    getCurrentAuthenticatedSessionMock.mockResolvedValueOnce({
      id: "session-test-id",
      accountId: 7,
    });
    findAccountByIdMock.mockResolvedValueOnce({
      id: 7,
      login: "tester01",
      status: "OK",
    });

    await expect(getCurrentAuthenticatedAccount()).resolves.toMatchObject({
      session: { id: "session-test-id", accountId: 7 },
      account: { id: 7, login: "tester01" },
    });
  });
});
