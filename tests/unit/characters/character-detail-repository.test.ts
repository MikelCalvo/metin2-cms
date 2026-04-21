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
  findCharacterDetailRowById,
  hasCharacterDetailDbConfigured,
} from "@/server/characters/character-detail-repository";

describe("character detail repository", () => {
  beforeEach(() => {
    getEnvMock.mockReset();
    queryMock.mockReset();
    getRankingPoolMock.mockReset();
    getRankingPoolMock.mockReturnValue({ query: queryMock });
  });

  it("reports whether the player database url is configured", () => {
    getEnvMock.mockReturnValueOnce({ PLAYER_DATABASE_URL: undefined });
    expect(hasCharacterDetailDbConfigured()).toBe(false);

    getEnvMock.mockReturnValueOnce({ PLAYER_DATABASE_URL: "mysql://rankings@localhost/player" });
    expect(hasCharacterDetailDbConfigured()).toBe(true);
  });

  it("queries one character detail row by id", async () => {
    queryMock.mockResolvedValueOnce([
      [
        {
          id: 3,
          name: "mk",
          job: 5,
          level: 99,
          exp: 0,
          playtime: 22,
          gold: 0,
          alignment: 15,
          lastPlay: "2026-04-19 00:27:14",
          mapIndex: 1,
          x: 469300,
          y: 964200,
          hp: 14024,
          mp: 2558,
          st: 4,
          ht: 3,
          dx: 6,
          iq: 3,
          statPoint: 270,
          skillPoint: 98,
          skillGroup: 0,
          subSkillPoint: 40,
          horseLevel: 30,
          horseHp: 50,
          horseStamina: 200,
          statResetCount: 0,
          guildId: null,
          guildName: null,
          guildGrade: null,
          guildIsGeneral: null,
          guildMasterId: null,
        },
      ],
    ]);

    await expect(findCharacterDetailRowById(3)).resolves.toEqual(
      expect.objectContaining({
        id: 3,
        name: "mk",
        mapIndex: 1,
      }),
    );

    expect(getRankingPoolMock).toHaveBeenCalled();
    expect(queryMock).toHaveBeenCalledWith(
      expect.stringContaining("WHERE p.id = ?"),
      [3],
    );
  });
});
