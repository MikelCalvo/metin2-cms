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

  it("renders a trimmed next-step block with only the useful follow-up routes", async () => {
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
    expect(html).toContain("If you are not done after the download, these are the other pages players usually open next.");
    expect(nextRouteRows).toHaveLength(3);
    expect(launchStepCards).toHaveLength(0);
    expect(html).toContain("Create account");
    expect(html).toContain("Set up your login first.");
    expect(html).toContain("First launch guide");
    expect(html).toContain("Shortest path to first login.");
    expect(html).toContain("Live rankings");
    expect(html).toContain("Check players and guilds.");
    expect(html).toContain('href="/downloads/client"');
    expect(html).toContain('href="/downloads/client/checksum"');
    expect(html).toContain('href="/register"');
    expect(html).toContain('href="/getting-started"');
    expect(html).toContain('href="/rankings"');
    expect(html).not.toContain("What players usually do next");
    expect(html).not.toContain("Account. First login. Ladder.");
    expect(html).not.toContain("Other useful pages");
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
