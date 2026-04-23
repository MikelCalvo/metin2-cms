import { describe, expect, it } from "vitest";

import { sanitizeDisplayText, sanitizeOptionalDisplayText } from "@/lib/display-text";

describe("display text sanitization", () => {
  it("removes invisible control characters, collapses whitespace, and neutralizes angle brackets", () => {
    expect(sanitizeDisplayText("  <script>\u202Ealert(1)</script>\nGuild\tName\u0000  ")).toBe(
      "‹script›alert(1)‹/script› Guild Name",
    );
  });

  it("returns null when optional content becomes empty after sanitization", () => {
    expect(sanitizeOptionalDisplayText(" \u0000\u202E  ")).toBeNull();
  });
});
