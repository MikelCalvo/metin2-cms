import { afterEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.resetModules();
});

describe("env", () => {
  it("throws when required env vars are missing and code actually reads them", async () => {
    process.env = { ...ORIGINAL_ENV };
    delete process.env.DATABASE_URL;
    delete process.env.CMS_DATABASE_URL;
    delete process.env.APP_BASE_URL;

    const { getEnv } = await import("@/lib/env");

    expect(() => getEnv()).toThrow("Invalid environment configuration");
  });

  it("parses valid environment variables when requested", async () => {
    process.env = {
      ...ORIGINAL_ENV,
      DATABASE_URL: "mysql://user:***@127.0.0.1:3306/account",
      CMS_DATABASE_URL: "mysql://user:***@127.0.0.1:3306/metin2_cms",
      SESSION_COOKIE_NAME: "mt2cms_session",
      SESSION_COOKIE_SECURE: "true",
      APP_BASE_URL: "http://localhost:3000",
    };

    const { env, getEnv } = await import("@/lib/env");
    const parsedEnv = getEnv();

    expect(parsedEnv.DATABASE_URL).toBe("mysql://user:***@127.0.0.1:3306/account");
    expect(parsedEnv.CMS_DATABASE_URL).toBe(
      "mysql://user:***@127.0.0.1:3306/metin2_cms",
    );
    expect(parsedEnv.SESSION_COOKIE_NAME).toBe("mt2cms_session");
    expect(parsedEnv.SESSION_COOKIE_SECURE).toBe(true);
    expect(parsedEnv.APP_BASE_URL).toBe("http://localhost:3000");
    expect(env.DATABASE_URL).toBe(parsedEnv.DATABASE_URL);
  });
});
