import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import GettingStartedPage from "@/app/getting-started/page";

describe("getting started page", () => {
  it("renders a short player onboarding flow", async () => {
    const html = renderToStaticMarkup(await GettingStartedPage());

    expect(html).toContain("Create account. Download. Patch. Enter.");
    expect(html).toContain("Keep the first session smooth");
    expect(html).toContain('href="/register"');
    expect(html).toContain('href="/downloads"');
    expect(html).toContain('href="/login"');
    expect(html).toContain('href="/recover"');
  });
});
