import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { createPoolMock, drizzleMock, getEnvMock } = vi.hoisted(() => ({
  createPoolMock: vi.fn(),
  drizzleMock: vi.fn(() => ({ mocked: true })),
  getEnvMock: vi.fn(),
}));

vi.mock("mysql2/promise", () => ({
  createPool: createPoolMock,
}));

vi.mock("drizzle-orm/mysql2", () => ({
  drizzle: drizzleMock,
}));

vi.mock("@/lib/env", () => ({
  getEnv: getEnvMock,
}));

function resetDbGlobals() {
  delete (globalThis as typeof globalThis & { __mt2CmsLegacyAccountPool?: unknown }).__mt2CmsLegacyAccountPool;
  delete (globalThis as typeof globalThis & { __mt2CmsWebPool?: unknown }).__mt2CmsWebPool;
  delete (globalThis as typeof globalThis & { __mt2CmsRankingPool?: unknown }).__mt2CmsRankingPool;
}

describe("db connection pools", () => {
  const previousNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    vi.resetModules();
    createPoolMock.mockReset();
    drizzleMock.mockReset();
    getEnvMock.mockReset();
    resetDbGlobals();
    (process.env as Record<string, string | undefined>).NODE_ENV = "production";
    getEnvMock.mockReturnValue({
      DATABASE_URL: "mysql://legacy@localhost/account",
      CMS_DATABASE_URL: "mysql://cms@localhost/metin2_cms",
      PLAYER_DATABASE_URL: "mysql://rankings@localhost/player",
      SESSION_COOKIE_NAME: "mt2cms_session",
      SESSION_COOKIE_SECURE: false,
      APP_BASE_URL: "http://localhost:3000",
    });
  });

  afterEach(() => {
    (process.env as Record<string, string | undefined>).NODE_ENV = previousNodeEnv;
    resetDbGlobals();
  });

  it("reuses the legacy pool in production instead of creating a new pool each call", async () => {
    const pool = { query: vi.fn(), end: vi.fn() };
    createPoolMock.mockReturnValue(pool);

    const connectionModule = await import("@/lib/db/connection");
    const first = connectionModule.getLegacyAccountPool();
    const second = connectionModule.getLegacyAccountPool();

    expect(first).toBe(pool);
    expect(second).toBe(pool);
    expect(createPoolMock).toHaveBeenCalledTimes(1);
  });

  it("reuses the ranking pool in production instead of creating a new pool each call", async () => {
    const pool = { query: vi.fn(), end: vi.fn() };
    createPoolMock.mockReturnValue(pool);

    const connectionModule = await import("@/lib/db/connection");
    const first = connectionModule.getRankingPool();
    const second = connectionModule.getRankingPool();

    expect(first).toBe(pool);
    expect(second).toBe(pool);
    expect(createPoolMock).toHaveBeenCalledTimes(1);
  });
});
