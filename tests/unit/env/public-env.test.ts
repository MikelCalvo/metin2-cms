import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("public env", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    delete process.env.DATABASE_URL;
    delete process.env.CMS_DATABASE_URL;
    delete process.env.APP_BASE_URL;
    delete process.env.PLAYER_DATABASE_URL;
    delete process.env.STARTER_PACK_URL;
    delete process.env.STARTER_PACK_SHA256;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("reads STARTER_PACK_URL without requiring database env vars", async () => {
    process.env.STARTER_PACK_URL = "https://downloads.example.test/releases/starter-pack.zip";
    process.env.STARTER_PACK_SHA256 = "abc123";

    const { getPublicEnv } = await import("@/lib/env");

    expect(getPublicEnv().STARTER_PACK_URL).toBe("https://downloads.example.test/releases/starter-pack.zip");
    expect(getPublicEnv().STARTER_PACK_SHA256).toBe("abc123");
  });

  it("returns an undefined starter-pack URL when it is not configured", async () => {
    const { getPublicEnv } = await import("@/lib/env");

    expect(getPublicEnv().STARTER_PACK_URL).toBeUndefined();
  });
});
