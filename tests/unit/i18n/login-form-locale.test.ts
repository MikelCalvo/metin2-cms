import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const { useActionStateMock } = vi.hoisted(() => ({
  useActionStateMock: vi.fn(),
}));

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");

  return {
    ...actual,
    useActionState: useActionStateMock,
  };
});

vi.mock("@/app/auth/actions", () => ({
  loginAction: vi.fn(),
}));

import { I18nProvider } from "@/components/i18n/i18n-provider";
import { LoginForm } from "@/components/auth/login-form";

describe("login form locale", () => {
  it("renders german labels when the provider locale is de", () => {
    useActionStateMock.mockReturnValue([{ status: "idle" }, vi.fn()]);

    const html = renderToStaticMarkup(
      createElement(
        I18nProvider,
        { locale: "de" },
        createElement(LoginForm),
      ),
    );

    expect(html).toContain("Anmelden");
    expect(html).toContain("Passwort vergessen?");
    expect(html).toContain("Konto erstellen");
    expect(html).toContain('aria-label="Passwort anzeigen"');
    expect(html).not.toContain("Forgot password?");
  });
});
