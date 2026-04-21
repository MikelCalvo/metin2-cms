import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getCharacterDetailMock, notFoundMock } = vi.hoisted(() => ({
  getCharacterDetailMock: vi.fn(),
  notFoundMock: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

vi.mock("next/navigation", () => ({
  notFound: notFoundMock,
}));

vi.mock("@/server/characters/character-detail-service", () => ({
  getCharacterDetail: getCharacterDetailMock,
}));

import CharacterDetailPage from "@/app/characters/[id]/page";

describe("character detail page", () => {
  beforeEach(() => {
    getCharacterDetailMock.mockReset();
    notFoundMock.mockClear();
  });

  it("renders a full public profile for one live character", async () => {
    getCharacterDetailMock.mockResolvedValueOnce({
      status: "available",
      character: {
        id: 3,
        name: "mk",
        job: 5,
        classLabel: "Sura",
        level: 99,
        exp: 0,
        playtime: 22,
        gold: 0,
        alignment: 15,
        lastPlay: new Date(2026, 3, 19, 0, 27, 14),
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
        skillGroupLabel: "No group yet",
        subSkillPoint: 40,
        horseLevel: 30,
        horseHp: 50,
        horseStamina: 200,
        statResetCount: 0,
        guildId: null,
        guildName: null,
        guildRoleLabel: null,
      },
    });

    const html = renderToStaticMarkup(
      await CharacterDetailPage({
        params: Promise.resolve({ id: "3" }),
      }),
    );

    expect(html).toContain("Character profile");
    expect(html).toContain("mk");
    expect(html).toContain("Sura");
    expect(html).toContain("Progression");
    expect(html).toContain("Combat stats");
    expect(html).toContain("World");
    expect(html).toContain("Mount & skill state");
    expect(html).toContain("Level");
    expect(html).toContain("EXP");
    expect(html).toContain("Playtime");
    expect(html).toContain("Alignment");
    expect(html).toContain("Map");
    expect(html).toContain("Position");
    expect(html).toContain("Horse");
    expect(html).toContain('href="/rankings"');
    expect(html).toContain('href="/downloads"');
    expect(getCharacterDetailMock).toHaveBeenCalledWith(3, expect.any(String));
  });

  it("renders a compact unavailable state when the player feed is unavailable", async () => {
    getCharacterDetailMock.mockResolvedValueOnce({
      status: "unavailable",
      reason: "query_failed",
      message: "Character details are temporarily unavailable.",
    });

    const html = renderToStaticMarkup(
      await CharacterDetailPage({
        params: Promise.resolve({ id: "3" }),
      }),
    );

    expect(html).toContain("Character unavailable");
    expect(html).toContain("Character details are temporarily unavailable.");
  });

  it("uses notFound for invalid ids", async () => {
    await expect(
      CharacterDetailPage({
        params: Promise.resolve({ id: "abc" }),
      }),
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(getCharacterDetailMock).not.toHaveBeenCalled();
    expect(notFoundMock).toHaveBeenCalled();
  });

  it("uses notFound when the character does not exist", async () => {
    getCharacterDetailMock.mockResolvedValueOnce({ status: "not_found" });

    await expect(
      CharacterDetailPage({
        params: Promise.resolve({ id: "999" }),
      }),
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(getCharacterDetailMock).toHaveBeenCalledWith(999, expect.any(String));
    expect(notFoundMock).toHaveBeenCalled();
  });
});
