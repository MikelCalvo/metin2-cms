import { describe, expect, it } from "vitest";

import { formatCharacterClassLabel, formatRankingTimestamp } from "@/server/rankings/rankings-formatters";

describe("rankings formatters", () => {
  it("maps known Metin2 character jobs to class labels", () => {
    expect(formatCharacterClassLabel(0)).toBe("Warrior");
    expect(formatCharacterClassLabel(1)).toBe("Warrior");
    expect(formatCharacterClassLabel(2)).toBe("Ninja");
    expect(formatCharacterClassLabel(3)).toBe("Ninja");
    expect(formatCharacterClassLabel(4)).toBe("Sura");
    expect(formatCharacterClassLabel(5)).toBe("Sura");
    expect(formatCharacterClassLabel(6)).toBe("Shaman");
    expect(formatCharacterClassLabel(7)).toBe("Shaman");
    expect(formatCharacterClassLabel(8)).toBe("Lycan");
  });

  it("falls back to an unknown label for unsupported jobs", () => {
    expect(formatCharacterClassLabel(99)).toBe("Unknown");
  });

  it("formats timestamps into a compact account-style label", () => {
    expect(formatRankingTimestamp("2026-04-18 06:48:56", new Date("2026-04-18T12:00:00Z"))).toBe(
      "Today · 06:48",
    );
    expect(formatRankingTimestamp("2026-04-17 23:10:00", new Date("2026-04-18T12:00:00Z"))).toBe(
      "Yesterday · 23:10",
    );
  });

  it("returns an em dash for zero or missing timestamps", () => {
    expect(formatRankingTimestamp("0000-00-00 00:00:00")).toBe("—");
    expect(formatRankingTimestamp("")).toBe("—");
  });
});
