import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  redirectMock,
  getCurrentAuthenticatedAccountMock,
  revokeOtherSessionsForAccountMock,
  revokeSessionForAccountMock,
} = vi.hoisted(() => ({
  redirectMock: vi.fn(),
  getCurrentAuthenticatedAccountMock: vi.fn(),
  revokeOtherSessionsForAccountMock: vi.fn(),
  revokeSessionForAccountMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("@/server/auth/current-account", () => ({
  getCurrentAuthenticatedAccount: getCurrentAuthenticatedAccountMock,
}));

vi.mock("@/server/session/session-service", () => ({
  revokeOtherSessionsForAccount: revokeOtherSessionsForAccountMock,
  revokeSessionForAccount: revokeSessionForAccountMock,
}));

import { closeOtherSessionsAction, revokeSessionAction } from "@/app/account/actions";

describe("account actions", () => {
  beforeEach(() => {
    redirectMock.mockReset();
    getCurrentAuthenticatedAccountMock.mockReset();
    revokeOtherSessionsForAccountMock.mockReset();
    revokeSessionForAccountMock.mockReset();
    redirectMock.mockImplementation(() => {
      throw new Error("NEXT_REDIRECT");
    });
  });

  it("redirects to login when there is no authenticated session", async () => {
    getCurrentAuthenticatedAccountMock.mockResolvedValueOnce(null);

    await expect(closeOtherSessionsAction()).rejects.toThrow("NEXT_REDIRECT");

    expect(revokeOtherSessionsForAccountMock).not.toHaveBeenCalled();
    expect(redirectMock).toHaveBeenCalledWith("/login");
  });

  it("revokes other sessions and redirects back to account", async () => {
    getCurrentAuthenticatedAccountMock.mockResolvedValueOnce({
      session: { id: "session-current", accountId: 7 },
      account: { id: 7, login: "tester01" },
    });

    await expect(closeOtherSessionsAction()).rejects.toThrow("NEXT_REDIRECT");

    expect(revokeOtherSessionsForAccountMock).toHaveBeenCalledWith(7, "session-current");
    expect(redirectMock).toHaveBeenCalledWith("/account");
  });

  it("revokes a selected session and redirects back to account", async () => {
    getCurrentAuthenticatedAccountMock.mockResolvedValueOnce({
      session: { id: "session-current", accountId: 7 },
      account: { id: 7, login: "tester01" },
    });

    const formData = new FormData();
    formData.set("sessionId", "session-other");

    await expect(revokeSessionAction(formData)).rejects.toThrow("NEXT_REDIRECT");

    expect(revokeSessionForAccountMock).toHaveBeenCalledWith(
      7,
      "session-other",
      "session-current",
    );
    expect(redirectMock).toHaveBeenCalledWith("/account");
  });

  it("redirects back to account without revoking when sessionId is missing", async () => {
    getCurrentAuthenticatedAccountMock.mockResolvedValueOnce({
      session: { id: "session-current", accountId: 7 },
      account: { id: 7, login: "tester01" },
    });

    await expect(revokeSessionAction(new FormData())).rejects.toThrow("NEXT_REDIRECT");

    expect(revokeSessionForAccountMock).not.toHaveBeenCalled();
    expect(redirectMock).toHaveBeenCalledWith("/account");
  });
});
