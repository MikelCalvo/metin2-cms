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

  it("keeps rankings direct, removes guild filler, and uses clickable next-step cards", async () => {
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

    expect(html).toContain("Character ladder");
    expect(html).toContain("Top 3 right now");
    expect(html).toContain("Guild champion");
    expect(html).toContain("Guild ladder");
    expect(html).toContain("Ready to climb?");
    expect(html).toContain("mk");
    expect(html).toContain("Sura");
    expect(html).toContain("[GM-TEAM]");
    expect(html).toContain("2m");
    expect(html).toContain('href="/characters/1"');
    expect(html).toContain('data-slot="ranking-highlight-card"');
    expect(html).toContain('data-slot="route-card"');
    expect(html).toContain('href="/downloads"');
    expect(html).toContain('href="/register"');
    expect(html).toContain('href="/login"');
    expect(html).not.toContain('href="/getting-started"');
    expect(html).not.toContain("First launch");
    expect(html).not.toContain("The ladder is live.");
    expect(html).not.toContain("Level, EXP and playtime decide the order.");
    expect(html).not.toContain("Ladder points lead the guild board.");
    expect(html).not.toContain("Top characters on the live server.");
    expect(html).not.toContain("Guild standings on the live server.");
    expect(html).not.toContain("Account. Download. Sign in.");
    expect(html).not.toContain("Straight from the current player database.");
    expect(html).not.toContain("What this board shows");
  });

  it("renders a compact unavailable state when rankings cannot be loaded", async () => {
    getRankingOverviewMock.mockResolvedValueOnce({
      status: "unavailable",
      reason: "not_configured",
      message: "Rankings are not configured yet.",
    });

    const html = renderToStaticMarkup(await RankingsPage());

    expect(html).toContain("Live rankings unavailable");
    expect(html).toContain("Rankings are not configured yet.");
  });
});
