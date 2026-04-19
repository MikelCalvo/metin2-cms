import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const { cookiesMock, refreshMock } = vi.hoisted(() => ({
  cookiesMock: vi.fn(),
  refreshMock: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: cookiesMock,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: refreshMock }),
}));

vi.mock("next/font/google", () => ({
  Geist: () => ({ className: "geist", variable: "--font-sans" }),
}));

import RootLayout from "@/app/layout";

describe("root layout locale chrome", () => {
  it("renders the global locale switcher and sets html lang from the locale cookie", async () => {
    cookiesMock.mockResolvedValue({
      get: (name: string) =>
        name === "mt2-locale" ? { value: "tr" } : undefined,
    });

    const html = renderToStaticMarkup(
      await RootLayout({ children: createElement("div", null, "child") }),
    );

    expect(html).toContain('lang="tr"');
    expect(html).toContain('data-slot="locale-switcher"');
    expect(html).toContain("🇹🇷");
    expect(html).toContain("Türkçe");
    expect(html).toContain("Dil");
    expect(html).toContain("child");
  });
});
