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
});
