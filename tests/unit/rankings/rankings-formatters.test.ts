import { describe, expect, it } from "vitest";

import {
  formatCharacterClassLabel,
  formatPlaytimeDuration,
  formatRankingTimestamp,
} from "@/server/rankings/rankings-formatters";

describe("rankings formatters", () => {
  it("maps only the four supported legacy Metin2 character jobs to class labels", () => {
    expect(formatCharacterClassLabel(0)).toBe("Warrior");
    expect(formatCharacterClassLabel(1)).toBe("Warrior");
    expect(formatCharacterClassLabel(2)).toBe("Ninja");
    expect(formatCharacterClassLabel(3)).toBe("Ninja");
    expect(formatCharacterClassLabel(4)).toBe("Sura");
    expect(formatCharacterClassLabel(5)).toBe("Sura");
    expect(formatCharacterClassLabel(6)).toBe("Shaman");
    expect(formatCharacterClassLabel(7)).toBe("Shaman");
    expect(formatCharacterClassLabel(8)).toBe("Unknown");
  });

  it("falls back to a localized unknown label for unsupported jobs", () => {
    expect(formatCharacterClassLabel(8, "es")).toBe("Desconocido");
    expect(formatCharacterClassLabel(99)).toBe("Unknown");
  });

  it("formats playtime minutes with visible hour/minute units", () => {
    expect(formatPlaytimeDuration(5)).toBe("5m");
    expect(formatPlaytimeDuration(60)).toBe("1h");
    expect(formatPlaytimeDuration(2720)).toBe("45h 20m");
  });

  it("formats timestamps into natural public-facing relative labels", () => {
    expect(formatRankingTimestamp("2026-04-18 10:00:00", new Date(2026, 3, 18, 12, 0, 0))).toBe(
      "2 hours ago",
    );
    expect(formatRankingTimestamp("2026-01-18 12:00:00", new Date(2026, 3, 18, 12, 0, 0))).toBe(
      "3 months ago",
    );
    expect(formatRankingTimestamp("2026-04-18 14:00:00", new Date(2026, 3, 18, 12, 0, 0))).toBe(
      "in 2 hours",
    );
  });

  it("does not round players into the next larger unit too early", () => {
    expect(formatRankingTimestamp("2026-04-18 11:00:29", new Date(2026, 3, 18, 12, 0, 0))).toBe(
      "59 minutes ago",
    );
    expect(formatRankingTimestamp("2026-04-17 12:30:01", new Date(2026, 3, 18, 12, 0, 0))).toBe(
      "23 hours ago",
    );
  });

  it("shows online for very recent timestamps, including Date instances from mysql2", () => {
    expect(formatRankingTimestamp(new Date(2026, 3, 18, 11, 58, 0), new Date(2026, 3, 18, 12, 0, 0))).toBe(
      "Online",
    );
  });

  it("returns an em dash for zero or missing timestamps", () => {
    expect(formatRankingTimestamp("0000-00-00 00:00:00")).toBe("—");
    expect(formatRankingTimestamp("")).toBe("—");
  });
});
