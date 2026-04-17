import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  redirectMock,
  getCurrentAuthenticatedAccountMock,
  revokeOtherSessionsForAccountMock,
} = vi.hoisted(() => ({
  redirectMock: vi.fn(),
  getCurrentAuthenticatedAccountMock: vi.fn(),
  revokeOtherSessionsForAccountMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("@/server/auth/current-account", () => ({
  getCurrentAuthenticatedAccount: getCurrentAuthenticatedAccountMock,
}));

vi.mock("@/server/session/session-service", () => ({
  revokeOtherSessionsForAccount: revokeOtherSessionsForAccountMock,
}));

import { closeOtherSessionsAction } from "@/app/account/actions";

describe("account actions", () => {
  beforeEach(() => {
    redirectMock.mockReset();
    getCurrentAuthenticatedAccountMock.mockReset();
    revokeOtherSessionsForAccountMock.mockReset();
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
});
