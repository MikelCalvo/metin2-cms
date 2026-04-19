import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import Home from "@/app/page";

describe("home page", () => {
  it("renders a stripped-down landing focused on the hero and core routes", async () => {
    const html = renderToStaticMarkup(await Home());

    expect(html).toContain("Enter the server.");
    expect(html).toContain("Start climbing.");
    expect(html).toContain("The routes that matter");
    expect(html).toContain("Four routes. No filler.");
    expect(html).toContain("Download launcher");
    expect(html).toContain("Create account");
    expect(html).toContain('href="/downloads"');
    expect(html).not.toContain("Download starter pack");
    expect(html).toContain('href="/register"');
    expect(html).toContain('href="/rankings"');
    expect(html).not.toContain("Enter the shard");
    expect(html).not.toContain("Patch up. Enter the server. Start climbing.");
    expect(html).not.toContain("Download & patch");
    expect(html).not.toContain("Ladder live");
    expect(html).not.toContain("Account ready");
    expect(html).not.toContain("Server loop");
    expect(html).not.toContain("Download. Enter. Climb.");
  });
});
