import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/cms/site-header", () => ({
  SiteHeader: () => createElement("div", null, "site-header"),
}));

import { SitePageShell } from "@/components/cms/site-page-shell";

describe("site page shell", () => {
  it("renders the public shell without a footer", () => {
    const html = renderToStaticMarkup(createElement(SitePageShell, null, createElement("div", null, "page-content")));

    expect(html).toContain("site-header");
    expect(html).toContain("page-content");
    expect(html).not.toContain("site-footer");
  });
});
