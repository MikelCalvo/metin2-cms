import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

import { SiteFooter } from "@/components/cms/site-footer";
import { SiteHeader } from "@/components/cms/site-header";

describe("site chrome", () => {
  it("renders player-facing header actions and a footer that mirrors the active nav state", () => {
    const headerHtml = renderToStaticMarkup(createElement(SiteHeader));
    const footerHtml = renderToStaticMarkup(createElement(SiteFooter));

    expect(headerHtml).toContain("Live ladders");
    expect(headerHtml).toContain("Create account");
    expect(headerHtml).toContain("Sign in");
    expect(headerHtml).toContain('href="/downloads"');
    expect(headerHtml).toContain('href="/register"');
    expect(headerHtml).toContain('href="/login"');

    expect(footerHtml).toContain("Windows · Linux");
    expect(footerHtml).toContain('href="/login"');
    expect(footerHtml).toContain('aria-current="page"');
    expect(footerHtml).toContain("border-violet-400/30 bg-violet-500/10 text-violet-100");
    expect(footerHtml).not.toContain("Launcher, account, rankings.");
    expect(footerHtml).not.toContain("Download. Patch. Climb.");
    expect(footerHtml).not.toContain("Windows · Wine · Ladders · Launcher updates.");
  });
});
