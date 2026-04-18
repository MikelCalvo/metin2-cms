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

  it("renders a polished download surface with platform support and checksum actions when configured", async () => {
    getPublicEnvMock.mockReturnValue({
      STARTER_PACK_URL: "https://downloads.example.test/releases/starter-pack.zip",
      STARTER_PACK_SHA256: "abc123",
    });

    const html = renderToStaticMarkup(await DownloadsPage());

    expect(html).toContain("Download starter pack");
    expect(html).toContain("SHA256 checksum");
    expect(html).toContain("Official Windows support");
    expect(html).toContain("Linux via Wine");
    expect(html).toContain("launcher that auto-updates the game");
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
