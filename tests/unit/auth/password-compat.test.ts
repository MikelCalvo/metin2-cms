import { beforeEach, describe, expect, it, vi } from "vitest";

const { queryMock } = vi.hoisted(() => ({
  queryMock: vi.fn(),
}));

vi.mock("@/lib/db/connection", () => ({
  getLegacyAccountPool: () => ({
    query: queryMock,
  }),
}));

import {
  hashPasswordWithLegacyAlgorithm,
  isLegacyPasswordHash,
  verifyLegacyPassword,
} from "@/server/auth/password-compat";

describe("legacy password compatibility", () => {
  beforeEach(() => {
    queryMock.mockReset();
  });

  it("accepts PASSWORD()-style hashes", () => {
    expect(isLegacyPasswordHash("*BFDD8499E2AE949440E4DDBF1115D4A41471FE75")).toBe(true);
  });

  it("rejects non-legacy hash shapes", () => {
    expect(isLegacyPasswordHash("plain-text-password")).toBe(false);
    expect(isLegacyPasswordHash("$2b$10$abcdefghijklmnopqrstuv")).toBe(false);
    expect(isLegacyPasswordHash("")).toBe(false);
  });

  it("hashes a password through the live MariaDB-compatible function", async () => {
    queryMock.mockResolvedValueOnce([
      [{ hash: "*BFDD8499E2AE949440E4DDBF1115D4A41471FE75" }],
    ]);

    await expect(hashPasswordWithLegacyAlgorithm("abc12345")).resolves.toBe(
      "*BFDD8499E2AE949440E4DDBF1115D4A41471FE75",
    );
    expect(queryMock).toHaveBeenCalledWith("SELECT PASSWORD(?) AS hash", [
      "abc12345",
    ]);
  });

  it("verifies a matching password", async () => {
    queryMock.mockResolvedValueOnce([
      [{ hash: "*BFDD8499E2AE949440E4DDBF1115D4A41471FE75" }],
    ]);

    await expect(
      verifyLegacyPassword(
        "abc12345",
        "*BFDD8499E2AE949440E4DDBF1115D4A41471FE75",
      ),
    ).resolves.toBe(true);
  });

  it("rejects a non-matching password", async () => {
    queryMock.mockResolvedValueOnce([
      [{ hash: "*AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" }],
    ]);

    await expect(
      verifyLegacyPassword(
        "abc12345",
        "*BFDD8499E2AE949440E4DDBF1115D4A41471FE75",
      ),
    ).resolves.toBe(false);
  });
});
