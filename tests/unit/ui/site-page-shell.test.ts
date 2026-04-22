import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getCurrentAuthenticatedAccountMock } = vi.hoisted(() => ({
  getCurrentAuthenticatedAccountMock: vi.fn(),
}));

vi.mock("@/server/auth/current-account", () => ({
  getCurrentAuthenticatedAccount: getCurrentAuthenticatedAccountMock,
}));

vi.mock("@/components/cms/site-header", () => ({
  SiteHeader: ({
    accountLogin,
    isAuthenticated,
  }: {
    accountLogin?: string;
    isAuthenticated?: boolean;
  }) =>
    createElement(
      "div",
      {
        "data-account-login": accountLogin ?? "guest",
        "data-authenticated": isAuthenticated ? "true" : "false",
      },
      `site-header:${isAuthenticated ? accountLogin ?? "account" : "guest"}`,
    ),
}));

import { SitePageShell } from "@/components/cms/site-page-shell";

describe("site page shell", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getCurrentAuthenticatedAccountMock.mockResolvedValue(null);
  });

  it("renders the public shell without a footer", async () => {
    const html = renderToStaticMarkup(
      await SitePageShell({ children: createElement("div", null, "page-content") }),
    );

    expect(html).toContain("site-header:guest");
    expect(html).toContain('data-account-login="guest"');
    expect(html).toContain('data-authenticated="false"');
    expect(html).toContain("page-content");
    expect(html).not.toContain("site-footer");
  });

  it("passes the authenticated account link into the shared site header", async () => {
    getCurrentAuthenticatedAccountMock.mockResolvedValue({
      account: { id: 7, login: "admin", status: "OK" },
      session: { id: "session-1", accountId: 7 },
    });

    const html = renderToStaticMarkup(
      await SitePageShell({ children: createElement("div", null, "page-content") }),
    );

    expect(html).toContain("site-header:admin");
    expect(html).toContain('data-account-login="admin"');
    expect(html).toContain('data-authenticated="true"');
  });

  it("falls back to the guest header when the auth lookup fails", async () => {
    getCurrentAuthenticatedAccountMock.mockRejectedValue(new Error("db unavailable"));

    const html = renderToStaticMarkup(
      await SitePageShell({ children: createElement("div", null, "page-content") }),
    );

    expect(html).toContain("site-header:guest");
    expect(html).toContain('data-account-login="guest"');
    expect(html).toContain('data-authenticated="false"');
  });
});
