import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  hasAccountCharactersDbConfiguredMock,
  listAccountCharacterRowsMock,
} = vi.hoisted(() => ({
  hasAccountCharactersDbConfiguredMock: vi.fn(),
  listAccountCharacterRowsMock: vi.fn(),
}));

vi.mock("@/server/account/account-characters-repository", () => ({
  hasAccountCharactersDbConfigured: hasAccountCharactersDbConfiguredMock,
  listAccountCharacterRows: listAccountCharacterRowsMock,
}));

import { getAccountCharactersOverview } from "@/server/account/account-characters-service";

describe("account characters service", () => {
  beforeEach(() => {
    hasAccountCharactersDbConfiguredMock.mockReset();
    listAccountCharacterRowsMock.mockReset();
  });

  it("returns an unavailable result when the player database is not configured", async () => {
    hasAccountCharactersDbConfiguredMock.mockReturnValueOnce(false);

    await expect(getAccountCharactersOverview(7)).resolves.toMatchObject({
      status: "unavailable",
      reason: "not_configured",
    });

    expect(listAccountCharacterRowsMock).not.toHaveBeenCalled();
  });

  it("maps live character rows into localized account character entries", async () => {
    hasAccountCharactersDbConfiguredMock.mockReturnValueOnce(true);
    listAccountCharacterRowsMock.mockResolvedValueOnce([
      {
        id: 3,
        name: "mk",
        job: 7,
        level: 99,
        exp: 0,
        playtime: 2,
        lastPlay: new Date(2026, 3, 18, 5, 45, 44),
        guildName: null,
      },
      {
        id: 9,
        name: "WarBoss",
        job: 0,
        level: 75,
        exp: 12345,
        playtime: 77,
        lastPlay: "2026-04-17 05:45:44",
        guildName: "[GM-TEAM]",
      },
    ]);

    await expect(getAccountCharactersOverview(7, "es")).resolves.toEqual({
      status: "available",
      characters: [
        expect.objectContaining({
          id: 3,
          name: "mk",
          classLabel: "Chamán",
          guildName: null,
        }),
        expect.objectContaining({
          id: 9,
          name: "WarBoss",
          classLabel: "Guerrero",
          guildName: "[GM-TEAM]",
        }),
      ],
    });

    expect(listAccountCharacterRowsMock).toHaveBeenCalledWith(7);
  });

  it("sanitizes character and guild names before exposing them to the UI", async () => {
    hasAccountCharactersDbConfiguredMock.mockReturnValueOnce(true);
    listAccountCharacterRowsMock.mockResolvedValueOnce([
      {
        id: 12,
        name: "<img src=x onerror=alert(1)>",
        job: 0,
        level: 75,
        exp: 12345,
        playtime: 77,
        lastPlay: "2026-04-17 05:45:44",
        guildName: "\u202E<GM>\nLegends\u0000",
      },
    ]);

    await expect(getAccountCharactersOverview(7)).resolves.toEqual({
      status: "available",
      characters: [
        expect.objectContaining({
          id: 12,
          name: "‹img src=x onerror=alert(1)›",
          guildName: "‹GM› Legends",
          classLabel: "Warrior",
        }),
      ],
    });
  });

  it("returns an unavailable result and logs when the player query fails", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    hasAccountCharactersDbConfiguredMock.mockReturnValueOnce(true);
    listAccountCharacterRowsMock.mockRejectedValueOnce(new Error("db down"));

    await expect(getAccountCharactersOverview(7)).resolves.toMatchObject({
      status: "unavailable",
      reason: "query_failed",
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Failed to load account characters",
      expect.any(Error),
    );
  });
});
