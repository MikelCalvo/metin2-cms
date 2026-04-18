import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import Home from "@/app/page";

describe("home page", () => {
  it("renders a game-first landing with clear player routes", async () => {
    const html = renderToStaticMarkup(await Home());

    expect(html).toContain("Patch up. Enter the server. Start climbing.");
    expect(html).toContain("The routes that matter");
    expect(html).toContain("Four routes. No filler.");
    expect(html).toContain('href="/downloads"');
    expect(html).toContain('href="/register"');
    expect(html).toContain('href="/rankings"');
  });
});
