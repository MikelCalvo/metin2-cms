import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

import { SiteHeader } from "@/components/cms/site-header";

describe("site chrome", () => {
  it("renders a cleaner header with a single download entry point and outline auth actions", () => {
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
    expect(headerHtml).not.toContain("Start playing");
    expect(headerHtml).not.toContain('href="/getting-started"');
    expect(headerHtml).not.toContain("shadow-violet-950/40");
    expect(headerHtml).not.toContain("text-sm text-zinc-400 transition-colors hover:text-white");
  });
});
