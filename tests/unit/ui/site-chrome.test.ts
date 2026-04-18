import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

import { SiteHeader } from "@/components/cms/site-header";

describe("site chrome", () => {
  it("renders player-facing header actions", () => {
    const headerHtml = renderToStaticMarkup(createElement(SiteHeader));

    expect(headerHtml).toContain("Live ladders");
    expect(headerHtml).toContain("Create account");
    expect(headerHtml).toContain("Sign in");
    expect(headerHtml).toContain('href="/downloads"');
    expect(headerHtml).toContain('href="/register"');
    expect(headerHtml).toContain('href="/login"');
  });
});
