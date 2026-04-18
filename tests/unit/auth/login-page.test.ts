import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getCurrentAuthenticatedAccountMock, redirectMock, useActionStateMock } = vi.hoisted(() => ({
  getCurrentAuthenticatedAccountMock: vi.fn(),
  redirectMock: vi.fn(),
  useActionStateMock: vi.fn(),
}));

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");

  return {
    ...actual,
    useActionState: useActionStateMock,
  };
});

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("@/server/auth/current-account", () => ({
  getCurrentAuthenticatedAccount: getCurrentAuthenticatedAccountMock,
}));

vi.mock("@/app/auth/actions", () => ({
  loginAction: vi.fn(),
}));

import LoginPage from "@/app/login/page";

describe("login page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useActionStateMock.mockReturnValue([{ status: "idle" }, vi.fn()]);
  });

  it("renders a stripped-down login form with inline recovery and password visibility control", async () => {
    getCurrentAuthenticatedAccountMock.mockResolvedValue(null);

    const html = renderToStaticMarkup(await LoginPage({}));
    const passwordIndex = html.indexOf('name="password"');
    const recoverIndex = html.indexOf('href="/recover"');

    expect(html).toContain("Sign in");
    expect(html).toContain('name="login"');
    expect(html).toContain('name="password"');
    expect(html).toContain('href="/register"');
    expect(html).toContain('href="/recover"');
    expect(html).toContain('aria-label="Show password"');
    expect(passwordIndex).toBeGreaterThan(-1);
    expect(recoverIndex).toBeGreaterThan(passwordIndex);
    expect(html).not.toContain("Sign in to the modern Metin2 CMS");
    expect(html).not.toContain("Built around the live server contract");
    expect(html).not.toContain("Legacy-compatible auth");
    expect(html).not.toContain("Metin2 CMS");
  });
});
