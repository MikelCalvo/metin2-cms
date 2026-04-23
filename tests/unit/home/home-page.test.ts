import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getRankingOverviewMock } = vi.hoisted(() => ({
  getRankingOverviewMock: vi.fn(),
}));

vi.mock("@/server/rankings/rankings-service", () => ({
  getRankingOverview: getRankingOverviewMock,
}));

vi.mock("@/components/cms/site-page-shell", () => ({
  SitePageShell: ({ children }: { children: ReactNode }) => children,
}));

import Home from "@/app/page";

describe("home page", () => {
  beforeEach(() => {
    getRankingOverviewMock.mockReset();
  });

  it("renders a stripped-down landing with live server proof and core routes", async () => {
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
          guildName: "[GM-TEAM]",
        },
        {
          rank: 2,
          id: 2,
          name: "WarBoss",
          level: 88,
          exp: 0,
          playtime: 15,
          job: 0,
          classLabel: "Warrior",
          lastPlay: new Date(2026, 3, 17, 5, 45, 44),
          guildName: null,
        },
        {
          rank: 3,
          id: 3,
          name: "ShinsooQueen",
          level: 81,
          exp: 0,
          playtime: 30,
          job: 7,
          classLabel: "Shaman",
          lastPlay: new Date(2026, 3, 16, 5, 45, 44),
          guildName: "RedDragons",
        },
      ],
      guilds: [
        {
          rank: 1,
          id: 7,
          name: "[GM-TEAM]",
          level: 20,
          exp: 0,
          ladderPoint: 19000,
          win: 10,
          draw: 2,
          loss: 1,
        },
        {
          rank: 2,
          id: 8,
          name: "RedDragons",
          level: 19,
          exp: 0,
          ladderPoint: 14500,
          win: 8,
          draw: 1,
          loss: 3,
        },
        {
          rank: 3,
          id: 9,
          name: "BluePhoenix",
          level: 18,
          exp: 0,
          ladderPoint: 12200,
          win: 7,
          draw: 0,
          loss: 4,
        },
      ],
    });

    const html = renderToStaticMarkup(await Home());
    const publicActionTiles = html.match(/data-action-tile=\"true\"/g) ?? [];
    const platformChips = html.match(/data-slot=\"platform-chip\"/g) ?? [];
    const identityClassChips = html.match(/data-slot=\"identity-class-chip\"/g) ?? [];
    const identityGuildRows = html.match(/data-slot=\"identity-guild-row\"/g) ?? [];
    const identityPlayerRows = html.match(/data-slot=\"identity-player-row\"/g) ?? [];

    expect(html).toContain("Enter the server.");
    expect(html).toContain("Start climbing.");
    expect(html).toContain("Server life, right now");
    expect(html).toContain("Live board");
    expect(html).toContain("Top 3 players");
    expect(html).toContain("Champion guild");
    expect(html).toContain("Built for guild wars, boss runs and class mains.");
    expect(html).toContain("Guild wars");
    expect(html).toContain("Boss runs");
    expect(html).toContain("Top 3 guilds");
    expect(html).toContain("Warrior");
    expect(html).toContain("Ninja");
    expect(html).toContain("Sura");
    expect(html).toContain("Shaman");
    expect(html).not.toContain("Lycan");
    expect(identityClassChips).toHaveLength(4);
    expect(html).toContain("mk");
    expect(html).toContain("WarBoss");
    expect(html).toContain("ShinsooQueen");
    expect(identityPlayerRows).toHaveLength(3);
    expect(html).toContain("[GM-TEAM]");
    expect(html).toContain("RedDragons");
    expect(html).toContain("BluePhoenix");
    expect(identityGuildRows).toHaveLength(3);
    expect(html).toContain("19,000 ladder");
    expect(html).toContain("The routes that matter");
    expect(html).toContain("Three routes. No filler.");
    expect(html).toContain("Download launcher");
    expect(html).toContain('data-platform-chip="windows"');
    expect(html).toContain('data-platform-chip="linux"');
    expect(platformChips).toHaveLength(2);
    expect(html).toContain("Windows");
    expect(html).toContain("Linux");
    expect(html).toContain("Wine");
    expect(html).not.toContain("Official Windows support");
    expect(html).not.toContain("Linux via Wine");
    expect(html).not.toContain("Auto-updating launcher");
    expect(html).not.toContain("Live player + guild rankings");
    expect(html).toContain("Create account");
    expect(html).toContain('href="/downloads"');
    expect(html).not.toContain("Download starter pack");
    expect(html).toContain('href="/register"');
    expect(html).toContain('href="/rankings"');
    expect(publicActionTiles).toHaveLength(3);
    expect(html).not.toContain('href="/getting-started"');
    expect(html).not.toContain("First launch");
    expect(html).not.toContain("Enter the shard");
    expect(html).not.toContain("Patch up. Enter the server. Start climbing.");
    expect(html).not.toContain("Download & patch");
    expect(html).not.toContain("Ladder live");
    expect(html).not.toContain("Account ready");
    expect(html).not.toContain("Server loop");
    expect(html).not.toContain("Download. Enter. Climb.");
  });
});
