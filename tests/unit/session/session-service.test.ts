import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  createWebSessionMock,
  findActiveSessionByIdMock,
  findActiveSessionForAccountByIdMock,
  touchActiveSessionLastSeenMock,
  revokeWebSessionMock,
  listActiveSessionsForAccountMock,
  revokeOtherActiveSessionsForAccountMock,
  cookiesMock,
} = vi.hoisted(() => ({
  createWebSessionMock: vi.fn(),
  findActiveSessionByIdMock: vi.fn(),
  findActiveSessionForAccountByIdMock: vi.fn(),
  touchActiveSessionLastSeenMock: vi.fn(),
  revokeWebSessionMock: vi.fn(),
  listActiveSessionsForAccountMock: vi.fn(),
  revokeOtherActiveSessionsForAccountMock: vi.fn(),
  cookiesMock: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: cookiesMock,
}));

vi.mock("@/server/session/session-repository", () => ({
  createWebSession: createWebSessionMock,
  findActiveSessionById: findActiveSessionByIdMock,
  findActiveSessionForAccountById: findActiveSessionForAccountByIdMock,
  touchActiveSessionLastSeen: touchActiveSessionLastSeenMock,
  revokeWebSession: revokeWebSessionMock,
  listActiveSessionsForAccount: listActiveSessionsForAccountMock,
  revokeOtherActiveSessionsForAccount: revokeOtherActiveSessionsForAccountMock,
}));

import {
  clearAuthenticatedSession,
  getCurrentAuthenticatedSession,
  issueAuthenticatedSession,
  listAuthenticatedSessionsForAccount,
  revokeOtherSessionsForAccount,
  revokeSessionForAccount,
} from "@/server/session/session-service";

describe("session service", () => {
  beforeEach(() => {
    createWebSessionMock.mockReset();
    findActiveSessionByIdMock.mockReset();
    findActiveSessionForAccountByIdMock.mockReset();
    touchActiveSessionLastSeenMock.mockReset();
    revokeWebSessionMock.mockReset();
    listActiveSessionsForAccountMock.mockReset();
    revokeOtherActiveSessionsForAccountMock.mockReset();
    cookiesMock.mockReset();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-17T14:00:00Z"));
    vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue(
      "session-test-id",
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("creates a session row and sets the cookie", async () => {
    const cookieStore = { set: vi.fn(), get: vi.fn(), delete: vi.fn() };
    cookiesMock.mockResolvedValueOnce(cookieStore);

    const session = await issueAuthenticatedSession({
      accountId: 7,
      login: "tester01",
      ip: "127.0.0.1",
      userAgent: "Vitest",
    });

    expect(session).toMatchObject({
      id: "session-test-id",
      accountId: 7,
      login: "tester01",
    });
    expect(createWebSessionMock).toHaveBeenCalled();
    expect(cookieStore.set).toHaveBeenCalled();
  });

  it("normalizes request metadata before persisting a session", async () => {
    const cookieStore = { set: vi.fn(), get: vi.fn(), delete: vi.fn() };
    cookiesMock.mockResolvedValueOnce(cookieStore);

    await issueAuthenticatedSession({
      accountId: 7,
      login: "tester01",
      ip: " \u0000203.0.113.9 , 10.0.0.1\r\n",
      userAgent: `\u0000Vitest\r\nBrowser\t${"x".repeat(600)}`,
    });

    const createdSession = createWebSessionMock.mock.calls[0]?.[0];

    expect(createdSession).toBeDefined();
    expect(createdSession.ip).toBe("203.0.113.9");
    expect(createdSession.userAgent).toHaveLength(512);
    expect(createdSession.userAgent).toMatch(/^Vitest Browser x+$/);
  });

  it("returns null when there is no session cookie", async () => {
    const cookieStore = { set: vi.fn(), get: vi.fn(() => undefined), delete: vi.fn() };
    cookiesMock.mockResolvedValueOnce(cookieStore);

    await expect(getCurrentAuthenticatedSession()).resolves.toBeNull();
  });

  it("loads the current session from the repository and refreshes last activity", async () => {
    const cookieStore = {
      set: vi.fn(),
      get: vi.fn(() => ({ value: "session-test-id" })),
      delete: vi.fn(),
    };
    cookiesMock.mockResolvedValueOnce(cookieStore);
    findActiveSessionByIdMock.mockResolvedValueOnce({
      id: "session-test-id",
      accountId: 7,
      login: "tester01",
      lastSeenAt: "2026-04-17 13:55:00",
    });

    await expect(getCurrentAuthenticatedSession()).resolves.toMatchObject({
      id: "session-test-id",
      accountId: 7,
      lastSeenAt: "2026-04-17 14:00:00",
    });

    expect(touchActiveSessionLastSeenMock).toHaveBeenCalledWith(
      "session-test-id",
      "2026-04-17 14:00:00",
      "2026-04-17 14:00:00",
    );
  });

  it("lists active sessions for an account", async () => {
    listActiveSessionsForAccountMock.mockResolvedValueOnce([
      { id: "session-a", accountId: 7, login: "tester01" },
      { id: "session-b", accountId: 7, login: "tester01" },
    ]);

    await expect(listAuthenticatedSessionsForAccount(7)).resolves.toEqual([
      expect.objectContaining({ id: "session-a" }),
      expect.objectContaining({ id: "session-b" }),
    ]);

    expect(listActiveSessionsForAccountMock).toHaveBeenCalledWith(
      7,
      expect.any(String),
    );
  });

  it("revokes other sessions for an account while keeping the current one", async () => {
    await revokeOtherSessionsForAccount(7, "session-test-id");

    expect(revokeOtherActiveSessionsForAccountMock).toHaveBeenCalledWith(
      7,
      "session-test-id",
      expect.any(String),
    );
  });

  it("revokes a selected session that belongs to the authenticated account", async () => {
    findActiveSessionForAccountByIdMock.mockResolvedValueOnce({
      id: "session-other",
      accountId: 7,
      login: "tester01",
    });

    await expect(
      revokeSessionForAccount(7, "session-other", "session-current"),
    ).resolves.toBe(true);

    expect(findActiveSessionForAccountByIdMock).toHaveBeenCalledWith(
      7,
      "session-other",
      expect.any(String),
    );
    expect(revokeWebSessionMock).toHaveBeenCalledWith(
      "session-other",
      expect.any(String),
    );
  });

  it("does not revoke the current session from the targeted revoke action", async () => {
    await expect(
      revokeSessionForAccount(7, "session-current", "session-current"),
    ).resolves.toBe(false);

    expect(findActiveSessionForAccountByIdMock).not.toHaveBeenCalled();
    expect(revokeWebSessionMock).not.toHaveBeenCalled();
  });

  it("does not revoke a session that does not belong to the account", async () => {
    findActiveSessionForAccountByIdMock.mockResolvedValueOnce(null);

    await expect(
      revokeSessionForAccount(7, "session-other", "session-current"),
    ).resolves.toBe(false);

    expect(revokeWebSessionMock).not.toHaveBeenCalled();
  });

  it("revokes and clears the current session", async () => {
    const cookieStore = {
      set: vi.fn(),
      get: vi.fn(() => ({ value: "session-test-id" })),
      delete: vi.fn(),
    };
    cookiesMock.mockResolvedValueOnce(cookieStore);

    await clearAuthenticatedSession();

    expect(revokeWebSessionMock).toHaveBeenCalledWith(
      "session-test-id",
      expect.any(String),
    );
    expect(cookieStore.delete).toHaveBeenCalled();
  });
});
