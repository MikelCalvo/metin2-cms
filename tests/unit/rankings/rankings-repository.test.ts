import { beforeEach, describe, expect, it, vi } from "vitest";

const { getEnvMock, queryMock, getRankingPoolMock } = vi.hoisted(() => ({
  getEnvMock: vi.fn(),
  queryMock: vi.fn(),
  getRankingPoolMock: vi.fn(),
}));

vi.mock("@/lib/env", () => ({
  getEnv: getEnvMock,
}));

vi.mock("@/lib/db/connection", () => ({
  getRankingPool: getRankingPoolMock,
}));

import {
  hasPlayerRankingDbConfigured,
  listTopGuildRankingRows,
  listTopPlayerRankingRows,
} from "@/server/rankings/rankings-repository";

describe("rankings repository", () => {
  beforeEach(() => {
    getEnvMock.mockReset();
    queryMock.mockReset();
    getRankingPoolMock.mockReset();
    getRankingPoolMock.mockReturnValue({ query: queryMock });
  });

  it("reports whether the ranking database url is configured", () => {
    getEnvMock.mockReturnValueOnce({ PLAYER_DATABASE_URL: undefined });
    expect(hasPlayerRankingDbConfigured()).toBe(false);

    getEnvMock.mockReturnValueOnce({ PLAYER_DATABASE_URL: "mysql://rankings@localhost/player" });
    expect(hasPlayerRankingDbConfigured()).toBe(true);
  });

  it("queries the top player rows from the ranking pool", async () => {
    queryMock.mockResolvedValueOnce([
      [{ id: 1, name: "mk", level: 99, exp: 0, playtime: 2, job: 5, lastPlay: "2026-04-18 05:45:44", guildName: null }],
    ]);

    await expect(listTopPlayerRankingRows(25)).resolves.toEqual([
      expect.objectContaining({ name: "mk", level: 99 }),
    ]);

    expect(getRankingPoolMock).toHaveBeenCalled();
    expect(queryMock).toHaveBeenCalledWith(expect.stringContaining("FROM player p"), [25]);
  });

  it("queries the top guild rows from the ranking pool", async () => {
    queryMock.mockResolvedValueOnce([
      [{ id: 1, name: "[GM-TEAM]", level: 20, exp: 0, ladderPoint: 19000, win: 0, draw: 0, loss: 0 }],
    ]);

    await expect(listTopGuildRankingRows(10)).resolves.toEqual([
      expect.objectContaining({ name: "[GM-TEAM]", ladderPoint: 19000 }),
    ]);

    expect(getRankingPoolMock).toHaveBeenCalled();
    expect(queryMock).toHaveBeenCalledWith(expect.stringContaining("FROM guild g"), [10]);
  });
});
