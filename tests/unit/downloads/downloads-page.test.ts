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

  it("renders a player-friendly download surface with checksum actions when configured", async () => {
    getPublicEnvMock.mockReturnValue({
      STARTER_PACK_URL: "https://downloads.example.test/releases/starter-pack.zip",
      STARTER_PACK_SHA256: "abc123",
    });

    const html = renderToStaticMarkup(await DownloadsPage());
    const launchStepCards = html.match(/data-slot=\"launch-step\"/g) ?? [];
    const nextRouteRows = html.match(/data-slot=\"next-route\"/g) ?? [];

    expect(html).toContain("One download between you and the server.");
    expect(html).toContain("Download launcher");
    expect(html).toContain("Resume-friendly");
    expect(html).toContain("What players usually do next");
    expect(html).toContain("Other useful pages");
    expect(launchStepCards).toHaveLength(3);
    expect(nextRouteRows).toHaveLength(3);
    expect(html).toContain('href="/downloads/client"');
    expect(html).toContain('href="/downloads/client/checksum"');
    expect(html).not.toContain("Ready to launch?");
    expect(html).not.toContain("Your launcher path starts here");
    expect(html).not.toContain("Open the next route");
    expect(html).not.toContain("Download starter pack");
    expect(html).not.toContain("Download the starter pack");
    expect(html).not.toContain("https://downloads.example.test/releases/starter-pack.zip");
  });

  it("shows a friendly placeholder state when the starter-pack URL is not configured", async () => {
    getPublicEnvMock.mockReturnValue({
      STARTER_PACK_URL: undefined,
    });

    const html = renderToStaticMarkup(await DownloadsPage());

    expect(html).toContain("The client will appear here");
    expect(html).not.toContain("Ready to launch?");
    expect(html).not.toContain("Your launcher path starts here");
    expect(html).toContain("Open getting started");
    expect(html).not.toContain('href="/downloads/client"');
    expect(html).not.toContain('href="/downloads/client/checksum"');
  });
});
