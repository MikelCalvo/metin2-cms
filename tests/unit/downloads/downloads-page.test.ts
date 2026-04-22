import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getPublicEnvMock } = vi.hoisted(() => ({
  getPublicEnvMock: vi.fn(),
}));

const { getStarterPackReleaseMetadataMock } = vi.hoisted(() => ({
  getStarterPackReleaseMetadataMock: vi.fn(),
}));

vi.mock("@/lib/env", () => ({
  getPublicEnv: getPublicEnvMock,
}));

vi.mock("@/server/downloads/starter-pack-metadata", () => ({
  getStarterPackReleaseMetadata: getStarterPackReleaseMetadataMock,
}));

vi.mock("@/components/cms/site-page-shell", () => ({
  SitePageShell: ({ children }: { children: ReactNode }) => children,
}));

import DownloadsPage from "@/app/downloads/page";

describe("downloads page", () => {
  beforeEach(() => {
    getPublicEnvMock.mockReset();
    getStarterPackReleaseMetadataMock.mockReset();
  });

  it("renders the launcher CTA plus an inline checksum copy block when the starter pack is configured", async () => {
    getPublicEnvMock.mockReturnValue({
      STARTER_PACK_URL: "https://downloads.example.test/releases/starter-pack.zip",
      STARTER_PACK_SHA256: "abc123",
    });
    getStarterPackReleaseMetadataMock.mockResolvedValue({
      filename: "Metin2-Starter-Pack.zip",
      buildTag: "release-2026-04-22",
      fileSizeBytes: 536870912,
      updatedAt: "Wed, 22 Apr 2026 03:00:00 GMT",
    });

    const html = renderToStaticMarkup(await DownloadsPage());
    const launchStepCards = html.match(/data-slot=\"launch-step\"/g) ?? [];
    const nextRouteRows = html.match(/data-slot=\"next-route\"/g) ?? [];
    const primaryActionGroups = html.match(/data-slot=\"downloads-primary-actions\"/g) ?? [];
    const largeButtons = html.match(/data-size=\"lg\"/g) ?? [];

    expect(html).toContain("One download between you and the server.");
    expect(html).toContain("Download launcher");
    expect(html).toContain("Release snapshot");
    expect(html).toContain("Archive");
    expect(html).toContain("Metin2-Starter-Pack.zip");
    expect(html).toContain("Build tag");
    expect(html).toContain("release-2026-04-22");
    expect(html).toContain("Updated");
    expect(html).toContain("Size");
    expect(html).toContain("512 MB");
    expect(html).toContain("After download: account, sign in, rankings.");
    expect(html).toContain("Resume-friendly");
    expect(primaryActionGroups).toHaveLength(1);
    expect(largeButtons).toHaveLength(1);
    expect(html).toContain("h-12 justify-between rounded-2xl");
    expect(html).toContain("After download: account, sign in, rankings.");
    expect(nextRouteRows).toHaveLength(3);
    expect(launchStepCards).toHaveLength(0);
    expect(html).toContain("Create account");
    expect(html).toContain("Set up your login first.");
    expect(html).toContain("Sign in");
    expect(html).toContain("Use your account once the launcher is ready.");
    expect(html).toContain("Live rankings");
    expect(html).toContain("Check players and guilds.");
    expect(html).toContain('href="/downloads/client"');
    expect(html).toContain("SHA256");
    expect(html).toContain("abc123");
    expect(html).toContain('data-slot="downloads-inline-checksum"');
    expect(html).toContain('aria-label="Copy SHA256 checksum"');
    expect(html).toContain('href="/register"');
    expect(html).toContain('href="/login"');
    expect(html).toContain('href="/rankings"');
    expect(html).not.toContain('href="/downloads/client/checksum"');
    expect(html).not.toContain('href="/getting-started"');
    expect(html).not.toContain("What is inside");
    expect(html).not.toContain("Current release notes");
    expect(html).not.toContain("One launcher path. One account path. Live ladder after patch.");
    expect(html).not.toContain("Verify SHA256");
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

  it("shows account-focused fallback actions when the starter-pack URL is not configured", async () => {
    getPublicEnvMock.mockReturnValue({
      STARTER_PACK_URL: undefined,
    });
    getStarterPackReleaseMetadataMock.mockResolvedValue(null);

    const html = renderToStaticMarkup(await DownloadsPage());
    const primaryActionGroups = html.match(/data-slot=\"downloads-primary-actions\"/g) ?? [];
    const largeButtons = html.match(/data-size=\"lg\"/g) ?? [];

    expect(primaryActionGroups).toHaveLength(1);
    expect(largeButtons).toHaveLength(2);
    expect(html).toContain("Create account");
    expect(html).toContain("Sign in");
    expect(html).not.toContain("Release snapshot");
    expect(html).not.toContain("Launcher download");
    expect(html).not.toContain("Quick launch");
    expect(html).not.toContain('href="/downloads/client"');
    expect(html).not.toContain('href="/downloads/client/checksum"');
    expect(html).not.toContain('href="/getting-started"');
  });
});
