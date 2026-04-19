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

  it("renders large hero download actions and removes the redundant launcher detail cards", async () => {
    getPublicEnvMock.mockReturnValue({
      STARTER_PACK_URL: "https://downloads.example.test/releases/starter-pack.zip",
      STARTER_PACK_SHA256: "abc123",
    });

    const html = renderToStaticMarkup(await DownloadsPage());
    const launchStepCards = html.match(/data-slot=\"launch-step\"/g) ?? [];
    const nextRouteRows = html.match(/data-slot=\"next-route\"/g) ?? [];
    const primaryActionGroups = html.match(/data-slot=\"downloads-primary-actions\"/g) ?? [];
    const largeButtons = html.match(/data-size=\"lg\"/g) ?? [];

    expect(html).toContain("One download between you and the server.");
    expect(html).toContain("Download launcher");
    expect(html).toContain("Resume-friendly");
    expect(primaryActionGroups).toHaveLength(1);
    expect(largeButtons).toHaveLength(2);
    expect(html).toContain("h-12 justify-between rounded-2xl");
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
    expect(html).not.toContain("Launcher download");
    expect(html).not.toContain("Launcher package, base client and checksum in one place.");
    expect(html).not.toContain("Quick launch");
    expect(html).not.toContain("What players need before first login.");
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

  it("shows the hero fallback actions without the removed detail cards when the starter-pack URL is not configured", async () => {
    getPublicEnvMock.mockReturnValue({
      STARTER_PACK_URL: undefined,
    });

    const html = renderToStaticMarkup(await DownloadsPage());
    const primaryActionGroups = html.match(/data-slot=\"downloads-primary-actions\"/g) ?? [];
    const largeButtons = html.match(/data-size=\"lg\"/g) ?? [];

    expect(primaryActionGroups).toHaveLength(1);
    expect(largeButtons).toHaveLength(2);
    expect(html).toContain("View install flow");
    expect(html).toContain("Open getting started");
    expect(html).not.toContain("The client will appear here");
    expect(html).not.toContain("Launcher download");
    expect(html).not.toContain("Quick launch");
    expect(html).not.toContain('href="/downloads/client"');
    expect(html).not.toContain('href="/downloads/client/checksum"');
  });
});
