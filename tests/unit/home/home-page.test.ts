import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import Home from "@/app/page";

describe("home page", () => {
  it("renders a player-facing landing with platform support and launcher messaging", async () => {
    const html = renderToStaticMarkup(await Home());

    expect(html).toContain("Official Windows support");
    expect(html).toContain("Linux via Wine");
    expect(html).toContain("auto-updating launcher");
    expect(html).toContain('href="/downloads"');
    expect(html).toContain('href="/register"');
  });
});
