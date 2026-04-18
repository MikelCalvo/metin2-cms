import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getPublicEnvMock } = vi.hoisted(() => ({
  getPublicEnvMock: vi.fn(),
}));

vi.mock("@/lib/env", () => ({
  getPublicEnv: getPublicEnvMock,
}));

import DownloadsPage from "@/app/downloads/page";

describe("downloads page", () => {
  beforeEach(() => {
    getPublicEnvMock.mockReset();
  });

  it("renders starter-pack and checksum entrypoints through CMS-owned routes when configured", async () => {
    getPublicEnvMock.mockReturnValue({
      STARTER_PACK_URL: "https://downloads.example.test/releases/starter-pack.zip",
    });

    const html = renderToStaticMarkup(await DownloadsPage());

    expect(html).toContain("Download starter pack");
    expect(html).toContain("SHA256 checksum");
    expect(html).toContain('href="/downloads/client"');
    expect(html).toContain('href="/downloads/client/checksum"');
    expect(html).not.toContain("https://downloads.example.test/releases/starter-pack.zip");
  });

  it("shows a pending publication state when the starter-pack URL is not configured", async () => {
    getPublicEnvMock.mockReturnValue({
      STARTER_PACK_URL: undefined,
    });

    const html = renderToStaticMarkup(await DownloadsPage());

    expect(html).toContain("Starter pack pending publication");
    expect(html).not.toContain('href="/downloads/client"');
  });
});
