import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const { cookiesMock } = vi.hoisted(() => ({
  cookiesMock: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: cookiesMock,
}));

vi.mock("next/font/google", () => ({
  Geist: () => ({ className: "geist", variable: "--font-sans" }),
}));

import RootLayout from "@/app/layout";

describe("root layout locale chrome", () => {
  it("sets html lang from the locale cookie without rendering a floating locale switcher", async () => {
    cookiesMock.mockResolvedValue({
      get: (name: string) =>
        name === "mt2-locale" ? { value: "tr" } : undefined,
    });

    const html = renderToStaticMarkup(
      await RootLayout({ children: createElement("div", null, "child") }),
    );

    expect(html).toContain('lang="tr"');
    expect(html).not.toContain('data-slot="locale-switcher"');
    expect(html).not.toContain("fixed top-4 right-4");
    expect(html).toContain("child");
  });
});
