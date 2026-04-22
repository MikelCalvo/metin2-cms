import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ refresh: vi.fn() }),
}));

import { SiteHeader } from "@/components/cms/site-header";

describe("site chrome", () => {
  it("renders the locale dropdown inside the header card and keeps the dropdown content available above the rest of the page", () => {
    const headerHtml = renderToStaticMarkup(createElement(SiteHeader));
    const downloadLinks = headerHtml.match(/href="\/downloads"/g) ?? [];
    const headerCtas = headerHtml.match(/data-slot="header-cta"/g) ?? [];

    expect(headerHtml).toContain("Live ladders");
    expect(headerHtml).toContain("Create account");
    expect(headerHtml).toContain("Sign in");
    expect(downloadLinks).toHaveLength(1);
    expect(headerCtas).toHaveLength(2);
    expect(headerHtml).toContain('href="/register"');
    expect(headerHtml).toContain('href="/login"');
    expect(headerHtml).toContain('data-slot="header-card"');
    expect(headerHtml).toContain('data-slot="header-right-actions"');
    expect(headerHtml).toContain('data-slot="locale-switcher"');
    expect(headerHtml).toContain('data-slot="locale-switcher-trigger"');
    expect(headerHtml).toContain('data-slot="locale-switcher-dropdown"');
    expect(headerHtml).toContain("overflow-visible");
    expect(headerHtml).toContain("z-50");
    expect(headerHtml).toContain("🇬🇧");
    expect(headerHtml).toContain("English");
    expect(headerHtml).not.toContain('data-slot="site-header-frame"');
    expect(headerHtml).not.toContain('data-slot="header-floating-locale"');
    expect(headerHtml).not.toContain('data-slot="header-auth-actions"');
    expect(headerHtml).not.toContain("fixed top-4 right-4");
    expect(headerHtml).not.toContain("Start playing");
    expect(headerHtml).not.toContain('href="/getting-started"');
    expect(headerHtml).not.toContain("shadow-violet-950/40");
    expect(headerHtml).not.toContain("text-sm text-zinc-400 transition-colors hover:text-white");
  });

  it("replaces guest auth links with a user icon plus the account login when the visitor is already signed in", () => {
    const headerHtml = renderToStaticMarkup(createElement(SiteHeader, { isAuthenticated: true, accountLogin: "admin" }));
    const headerCtas = headerHtml.match(/data-slot="header-cta"/g) ?? [];

    expect(headerHtml).toContain("admin");
    expect(headerHtml).toContain('href="/account"');
    expect(headerHtml).toContain('data-account-link="true"');
    expect(headerHtml).toContain("lucide-user");
    expect(headerCtas).toHaveLength(1);
    expect(headerHtml).not.toContain("My account");
    expect(headerHtml).not.toContain("Create account");
    expect(headerHtml).not.toContain("Sign in");
    expect(headerHtml).not.toContain('href="/register"');
    expect(headerHtml).not.toContain('href="/login"');
  });

  it("keeps the account shortcut visible even if the authenticated login is unavailable", () => {
    const headerHtml = renderToStaticMarkup(createElement(SiteHeader, { isAuthenticated: true, accountLogin: "" }));

    expect(headerHtml).toContain('href="/account"');
    expect(headerHtml).toContain("Account");
    expect(headerHtml).not.toContain("Create account");
    expect(headerHtml).not.toContain("Sign in");
  });
});
