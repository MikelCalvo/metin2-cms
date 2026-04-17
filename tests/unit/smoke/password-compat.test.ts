import { describe, expect, it } from "vitest";

import { isLegacyPasswordHash } from "@/server/auth/password-compat";

describe("legacy password hash shape", () => {
  it("accepts PASSWORD()-style hashes", () => {
    expect(isLegacyPasswordHash("*BFDD8499E2AE949440E4DDBF1115D4A41471FE75")).toBe(true);
  });

  it("rejects non-legacy hash shapes", () => {
    expect(isLegacyPasswordHash("plain-text-password")).toBe(false);
    expect(isLegacyPasswordHash("$2b$10$abcdefghijklmnopqrstuv")).toBe(false);
    expect(isLegacyPasswordHash("")).toBe(false);
  });
});
