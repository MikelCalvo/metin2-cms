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
  hasAccountCharactersDbConfigured,
  listAccountCharacterRows,
} from "@/server/account/account-characters-repository";

describe("account characters repository", () => {
  beforeEach(() => {
    getEnvMock.mockReset();
    queryMock.mockReset();
    getRankingPoolMock.mockReset();
    getRankingPoolMock.mockReturnValue({ query: queryMock });
  });

  it("reports whether the player database url is configured", () => {
    getEnvMock.mockReturnValueOnce({ PLAYER_DATABASE_URL: undefined });
    expect(hasAccountCharactersDbConfigured()).toBe(false);

    getEnvMock.mockReturnValueOnce({ PLAYER_DATABASE_URL: "mysql://rankings@localhost/player" });
    expect(hasAccountCharactersDbConfigured()).toBe(true);
  });

  it("queries character rows for one authenticated account", async () => {
    queryMock.mockResolvedValueOnce([
      [
        {
          id: 3,
          name: "mk",
          job: 7,
          level: 99,
          exp: 0,
          playtime: 2,
          lastPlay: "2026-04-18 05:45:44",
          guildName: null,
        },
      ],
    ]);

    await expect(listAccountCharacterRows(7)).resolves.toEqual([
      expect.objectContaining({ name: "mk", level: 99 }),
    ]);

    expect(getRankingPoolMock).toHaveBeenCalled();
    expect(queryMock).toHaveBeenCalledWith(
      expect.stringContaining("WHERE p.account_id = ? AND p.name <> ''"),
      [7],
    );
  });
});
