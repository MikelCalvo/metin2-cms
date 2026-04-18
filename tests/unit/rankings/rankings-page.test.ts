import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getRankingOverviewMock } = vi.hoisted(() => ({
  getRankingOverviewMock: vi.fn(),
}));

vi.mock("@/server/rankings/rankings-service", () => ({
  getRankingOverview: getRankingOverviewMock,
}));

import RankingsPage from "@/app/rankings/page";

describe("rankings page", () => {
  beforeEach(() => {
    getRankingOverviewMock.mockReset();
  });

  it("renders a public-facing player and guild ladder", async () => {
    getRankingOverviewMock.mockResolvedValueOnce({
      status: "available",
      players: [
        {
          rank: 1,
          id: 1,
          name: "mk",
          level: 99,
          exp: 0,
          playtime: 2,
          job: 5,
          classLabel: "Sura",
          lastPlay: new Date(2026, 3, 18, 5, 45, 44),
          guildName: null,
        },
      ],
      guilds: [
        {
          rank: 1,
          id: 1,
          name: "[GM-TEAM]",
          level: 20,
          exp: 0,
          ladderPoint: 19000,
          win: 0,
          draw: 0,
          loss: 0,
        },
      ],
    });

    const html = renderToStaticMarkup(await RankingsPage());

    expect(html).toContain("The ladder is live.");
    expect(html).toContain("Character ladder");
    expect(html).toContain("Guild ladder");
    expect(html).toContain("Ready to climb?");
    expect(html).toContain("mk");
    expect(html).toContain("Sura");
    expect(html).toContain("[GM-TEAM]");
    expect(html).toContain('href="/downloads"');
    expect(html).toContain('href="/register"');
  });

  it("renders a public unavailable state when rankings cannot be loaded", async () => {
    getRankingOverviewMock.mockResolvedValueOnce({
      status: "unavailable",
      reason: "not_configured",
      message: "Rankings are not configured yet.",
    });

    const html = renderToStaticMarkup(await RankingsPage());

    expect(html).toContain("The ladder is not available right now");
    expect(html).toContain("Rankings are not configured yet.");
  });
});
