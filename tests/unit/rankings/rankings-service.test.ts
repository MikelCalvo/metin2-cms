import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  hasPlayerRankingDbConfiguredMock,
  listTopPlayerRankingRowsMock,
  listTopGuildRankingRowsMock,
} = vi.hoisted(() => ({
  hasPlayerRankingDbConfiguredMock: vi.fn(),
  listTopPlayerRankingRowsMock: vi.fn(),
  listTopGuildRankingRowsMock: vi.fn(),
}));

vi.mock("@/server/rankings/rankings-repository", () => ({
  hasPlayerRankingDbConfigured: hasPlayerRankingDbConfiguredMock,
  listTopPlayerRankingRows: listTopPlayerRankingRowsMock,
  listTopGuildRankingRows: listTopGuildRankingRowsMock,
}));

import {
  GUILD_RANKING_LIMIT,
  PLAYER_RANKING_LIMIT,
  getRankingOverview,
} from "@/server/rankings/rankings-service";

describe("rankings service", () => {
  beforeEach(() => {
    hasPlayerRankingDbConfiguredMock.mockReset();
    listTopPlayerRankingRowsMock.mockReset();
    listTopGuildRankingRowsMock.mockReset();
  });

  it("returns an unavailable result when the ranking database is not configured", async () => {
    hasPlayerRankingDbConfiguredMock.mockReturnValueOnce(false);

    await expect(getRankingOverview()).resolves.toMatchObject({
      status: "unavailable",
      reason: "not_configured",
    });

    expect(listTopPlayerRankingRowsMock).not.toHaveBeenCalled();
    expect(listTopGuildRankingRowsMock).not.toHaveBeenCalled();
  });

  it("maps player and guild rows into ranked leaderboard entries", async () => {
    hasPlayerRankingDbConfiguredMock.mockReturnValueOnce(true);
    listTopPlayerRankingRowsMock.mockResolvedValueOnce([
      {
        id: 1,
        name: "[SA]Admin",
        level: 105,
        exp: 4478,
        playtime: 2305,
        job: 0,
        lastPlay: "2026-04-18 06:48:56",
        guildName: "[GM-TEAM]",
      },
      {
        id: 3,
        name: "mk",
        level: 99,
        exp: 0,
        playtime: 2,
        job: 7,
        lastPlay: "2026-04-18 05:45:44",
        guildName: null,
      },
    ]);
    listTopGuildRankingRowsMock.mockResolvedValueOnce([
      {
        id: 1,
        name: "[GM-TEAM]",
        level: 20,
        exp: 0,
        ladderPoint: 19000,
        win: 0,
        draw: 0,
        loss: 0,
      },
    ]);

    await expect(getRankingOverview()).resolves.toMatchObject({
      status: "available",
      players: [
        expect.objectContaining({
          rank: 1,
          name: "[SA]Admin",
          classLabel: "Warrior",
          guildName: "[GM-TEAM]",
        }),
        expect.objectContaining({
          rank: 2,
          name: "mk",
          classLabel: "Shaman",
          guildName: null,
        }),
      ],
      guilds: [
        expect.objectContaining({
          rank: 1,
          name: "[GM-TEAM]",
          ladderPoint: 19000,
        }),
      ],
    });

    expect(listTopPlayerRankingRowsMock).toHaveBeenCalledWith(PLAYER_RANKING_LIMIT);
    expect(listTopGuildRankingRowsMock).toHaveBeenCalledWith(GUILD_RANKING_LIMIT);
  });

  it("sanitizes player and guild names before returning ranking rows", async () => {
    hasPlayerRankingDbConfiguredMock.mockReturnValueOnce(true);
    listTopPlayerRankingRowsMock.mockResolvedValueOnce([
      {
        id: 1,
        name: "<script>alert(1)</script>",
        level: 105,
        exp: 4478,
        playtime: 2305,
        job: 0,
        lastPlay: "2026-04-18 06:48:56",
        guildName: "\u202E<Guild>\nOne",
      },
    ]);
    listTopGuildRankingRowsMock.mockResolvedValueOnce([
      {
        id: 1,
        name: "<img src=x onerror=alert(1)>",
        level: 20,
        exp: 0,
        ladderPoint: 19000,
        win: 0,
        draw: 0,
        loss: 0,
      },
    ]);

    await expect(getRankingOverview()).resolves.toMatchObject({
      status: "available",
      players: [
        expect.objectContaining({
          name: "‹script›alert(1)‹/script›",
          guildName: "‹Guild› One",
        }),
      ],
      guilds: [
        expect.objectContaining({
          name: "‹img src=x onerror=alert(1)›",
        }),
      ],
    });
  });

  it("returns an unavailable result and logs when the ranking query fails", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    hasPlayerRankingDbConfiguredMock.mockReturnValueOnce(true);
    listTopPlayerRankingRowsMock.mockRejectedValueOnce(new Error("db down"));
    listTopGuildRankingRowsMock.mockResolvedValueOnce([]);

    await expect(getRankingOverview()).resolves.toMatchObject({
      status: "unavailable",
      reason: "query_failed",
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Failed to load ranking overview",
      expect.any(Error),
    );
  });
});
