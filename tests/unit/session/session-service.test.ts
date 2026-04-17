import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  createWebSessionMock,
  findActiveSessionByIdMock,
  revokeWebSessionMock,
  cookiesMock,
} = vi.hoisted(() => ({
  createWebSessionMock: vi.fn(),
  findActiveSessionByIdMock: vi.fn(),
  revokeWebSessionMock: vi.fn(),
  cookiesMock: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: cookiesMock,
}));

vi.mock("@/server/session/session-repository", () => ({
  createWebSession: createWebSessionMock,
  findActiveSessionById: findActiveSessionByIdMock,
  revokeWebSession: revokeWebSessionMock,
}));

import {
  clearAuthenticatedSession,
  getCurrentAuthenticatedSession,
  issueAuthenticatedSession,
} from "@/server/session/session-service";

describe("session service", () => {
  beforeEach(() => {
    createWebSessionMock.mockReset();
    findActiveSessionByIdMock.mockReset();
    revokeWebSessionMock.mockReset();
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

  it("returns null when there is no session cookie", async () => {
    const cookieStore = { set: vi.fn(), get: vi.fn(() => undefined), delete: vi.fn() };
    cookiesMock.mockResolvedValueOnce(cookieStore);

    await expect(getCurrentAuthenticatedSession()).resolves.toBeNull();
  });

  it("loads the current session from the repository", async () => {
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
    });

    await expect(getCurrentAuthenticatedSession()).resolves.toMatchObject({
      id: "session-test-id",
      accountId: 7,
    });
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
