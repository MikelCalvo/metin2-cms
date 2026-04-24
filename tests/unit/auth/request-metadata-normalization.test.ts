import { describe, expect, it } from "vitest";

import { normalizeRequestMetadata } from "@/server/auth/request-metadata-normalization";

describe("request metadata normalization", () => {
  it("keeps the first forwarded ip, strips control characters, collapses whitespace, and clamps user agents", () => {
    const metadata = normalizeRequestMetadata({
      ip: " \u0000203.0.113.9 , 10.0.0.1\r\n",
      userAgent: `\u0000Vitest\r\nBrowser\t${"x".repeat(600)}`,
    });

    expect(metadata.ip).toBe("203.0.113.9");
    expect(metadata.userAgent).toHaveLength(512);
    expect(metadata.userAgent).toMatch(/^Vitest Browser x+$/);
  });

  it("returns null values when metadata becomes empty after normalization", () => {
    expect(
      normalizeRequestMetadata({
        ip: " \u0000\r\n ",
        userAgent: " \u202E\t ",
      }),
    ).toEqual({
      ip: null,
      userAgent: null,
    });
  });
});
