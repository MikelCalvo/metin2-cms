import { afterEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.resetModules();
});

describe("env", () => {
  it("throws when required env vars are missing", async () => {
    process.env = { ...ORIGINAL_ENV };
    delete process.env.DATABASE_URL;
    delete process.env.CMS_DATABASE_URL;
    delete process.env.APP_BASE_URL;

    await expect(import("@/lib/env")).rejects.toThrow(
      "Invalid environment configuration",
    );
  });

  it("parses valid environment variables", async () => {
    process.env = {
      ...ORIGINAL_ENV,
      DATABASE_URL: "mysql://user:password@127.0.0.1:3306/account",
      CMS_DATABASE_URL: "mysql://user:password@127.0.0.1:3306/metin2_cms",
      SESSION_COOKIE_NAME: "mt2cms_session",
      SESSION_COOKIE_SECURE: "true",
      APP_BASE_URL: "http://localhost:3000",
    };

    const { env } = await import("@/lib/env");

    expect(env.DATABASE_URL).toBe("mysql://user:password@127.0.0.1:3306/account");
    expect(env.CMS_DATABASE_URL).toBe(
      "mysql://user:password@127.0.0.1:3306/metin2_cms",
    );
    expect(env.SESSION_COOKIE_NAME).toBe("mt2cms_session");
    expect(env.SESSION_COOKIE_SECURE).toBe(true);
    expect(env.APP_BASE_URL).toBe("http://localhost:3000");
  });
});
