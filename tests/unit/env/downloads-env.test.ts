import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("downloads env", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    delete process.env.DATABASE_URL;
    delete process.env.CMS_DATABASE_URL;
    delete process.env.APP_BASE_URL;
    delete process.env.PLAYER_DATABASE_URL;
    delete process.env.STARTER_PACK_URL;
    delete process.env.STARTER_PACK_USERNAME;
    delete process.env.STARTER_PACK_PASSWORD;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("reads starter-pack auth env without requiring database env vars", async () => {
    process.env.STARTER_PACK_URL = "https://downloads.example.test/releases/starter-pack.zip";
    process.env.STARTER_PACK_USERNAME = "mt2update";
    process.env.STARTER_PACK_PASSWORD = "super-secret";

    const { getDownloadsEnv } = await import("@/lib/env");

    expect(getDownloadsEnv()).toEqual({
      STARTER_PACK_URL: "https://downloads.example.test/releases/starter-pack.zip",
      STARTER_PACK_USERNAME: "mt2update",
      STARTER_PACK_PASSWORD: "super-secret",
    });
  });

  it("rejects partial starter-pack credentials", async () => {
    process.env.STARTER_PACK_URL = "https://downloads.example.test/releases/starter-pack.zip";
    process.env.STARTER_PACK_USERNAME = "mt2update";

    const { getDownloadsEnv } = await import("@/lib/env");

    expect(() => getDownloadsEnv()).toThrow(/Invalid downloads environment configuration/);
  });
});
