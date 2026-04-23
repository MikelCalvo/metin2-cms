import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  hasCharacterDetailDbConfiguredMock,
  findCharacterDetailRowByIdMock,
} = vi.hoisted(() => ({
  hasCharacterDetailDbConfiguredMock: vi.fn(),
  findCharacterDetailRowByIdMock: vi.fn(),
}));

vi.mock("@/server/characters/character-detail-repository", () => ({
  hasCharacterDetailDbConfigured: hasCharacterDetailDbConfiguredMock,
  findCharacterDetailRowById: findCharacterDetailRowByIdMock,
}));

import { getCharacterDetail } from "@/server/characters/character-detail-service";

describe("character detail service", () => {
  beforeEach(() => {
    hasCharacterDetailDbConfiguredMock.mockReset();
    findCharacterDetailRowByIdMock.mockReset();
  });

  it("returns an unavailable result when the player database is not configured", async () => {
    hasCharacterDetailDbConfiguredMock.mockReturnValueOnce(false);

    await expect(getCharacterDetail(3)).resolves.toMatchObject({
      status: "unavailable",
      reason: "not_configured",
    });

    expect(findCharacterDetailRowByIdMock).not.toHaveBeenCalled();
  });

  it("returns not_found when the character id does not exist", async () => {
    hasCharacterDetailDbConfiguredMock.mockReturnValueOnce(true);
    findCharacterDetailRowByIdMock.mockResolvedValueOnce(null);

    await expect(getCharacterDetail(999)).resolves.toEqual({ status: "not_found" });
  });

  it("maps one live character row into a localized public detail payload", async () => {
    hasCharacterDetailDbConfiguredMock.mockReturnValueOnce(true);
    findCharacterDetailRowByIdMock.mockResolvedValueOnce({
      id: 1,
      name: "[SA]Admin",
      job: 0,
      level: 105,
      exp: 6077,
      playtime: 2720,
      gold: 1352348647,
      alignment: 193053,
      lastPlay: new Date(2026, 3, 19, 4, 48, 20),
      mapIndex: 1,
      x: 475076,
      y: 953024,
      hp: 14678,
      mp: 760,
      st: 90,
      ht: 90,
      dx: 90,
      iq: 15,
      statPoint: 0,
      skillPoint: 10,
      skillGroup: 2,
      subSkillPoint: 46,
      horseLevel: 30,
      horseHp: 49,
      horseStamina: 200,
      statResetCount: 0,
      guildId: 1,
      guildName: "[GM-TEAM]",
      guildGrade: 1,
      guildIsGeneral: 0,
      guildMasterId: 1,
    });

    await expect(getCharacterDetail(1, "es")).resolves.toEqual({
      status: "available",
      character: expect.objectContaining({
        id: 1,
        name: "[SA]Admin",
        classLabel: "Guerrero",
        guildRoleLabel: "Líder",
        skillGroupLabel: "Grupo 2",
      }),
    });

    expect(findCharacterDetailRowByIdMock).toHaveBeenCalledWith(1);
  });

  it("sanitizes character and guild labels before returning public character details", async () => {
    hasCharacterDetailDbConfiguredMock.mockReturnValueOnce(true);
    findCharacterDetailRowByIdMock.mockResolvedValueOnce({
      id: 1,
      name: "<img src=x onerror=alert(1)>",
      job: 0,
      level: 105,
      exp: 6077,
      playtime: 2720,
      gold: 1352348647,
      alignment: 193053,
      lastPlay: new Date(2026, 3, 19, 4, 48, 20),
      mapIndex: 1,
      x: 475076,
      y: 953024,
      hp: 14678,
      mp: 760,
      st: 90,
      ht: 90,
      dx: 90,
      iq: 15,
      statPoint: 0,
      skillPoint: 10,
      skillGroup: 2,
      subSkillPoint: 46,
      horseLevel: 30,
      horseHp: 49,
      horseStamina: 200,
      statResetCount: 0,
      guildId: 1,
      guildName: "\u202E<script>Guild</script>",
      guildGrade: 1,
      guildIsGeneral: 0,
      guildMasterId: 1,
    });

    await expect(getCharacterDetail(1)).resolves.toEqual({
      status: "available",
      character: expect.objectContaining({
        name: "‹img src=x onerror=alert(1)›",
        guildName: "‹script›Guild‹/script›",
      }),
    });
  });

  it("returns an unavailable result and logs when the query fails", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    hasCharacterDetailDbConfiguredMock.mockReturnValueOnce(true);
    findCharacterDetailRowByIdMock.mockRejectedValueOnce(new Error("db down"));

    await expect(getCharacterDetail(3)).resolves.toMatchObject({
      status: "unavailable",
      reason: "query_failed",
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Failed to load character detail",
      expect.any(Error),
    );
  });
});
