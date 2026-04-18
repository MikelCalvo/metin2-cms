import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { getDownloadsEnvMock } = vi.hoisted(() => ({
  getDownloadsEnvMock: vi.fn(),
}));

vi.mock("@/lib/env", () => ({
  getDownloadsEnv: getDownloadsEnvMock,
}));

import { GET } from "@/app/downloads/client/checksum/route";

describe("downloads client checksum route", () => {
  beforeEach(() => {
    getDownloadsEnvMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("proxies the checksum through the CMS with basic auth when credentials are configured", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response("hash  Metin2-Starter-Pack.zip", {
        status: 200,
        headers: {
          "content-type": "text/plain; charset=utf-8",
        },
      }),
    );

    vi.stubGlobal("fetch", fetchMock);

    getDownloadsEnvMock.mockReturnValue({
      STARTER_PACK_URL: "https://downloads.example.test/releases/starter-pack.zip",
      STARTER_PACK_USERNAME: "mt2update",
      STARTER_PACK_PASSWORD: "super-secret",
    });

    const response = await GET(new Request("https://cms.example.test/downloads/client/checksum"));

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("text/plain; charset=utf-8");
    await expect(response.text()).resolves.toBe("hash  Metin2-Starter-Pack.zip");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://downloads.example.test/releases/starter-pack.zip.sha256",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          authorization: `Basic ${Buffer.from("mt2update:super-secret").toString("base64")}`,
        }),
      }),
    );
  });

  it("redirects directly to the checksum URL when auth credentials are not configured", async () => {
    getDownloadsEnvMock.mockReturnValue({
      STARTER_PACK_URL: "https://downloads.example.test/releases/starter-pack.zip",
      STARTER_PACK_USERNAME: undefined,
      STARTER_PACK_PASSWORD: undefined,
    });

    const response = await GET(new Request("https://cms.example.test/downloads/client/checksum"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://downloads.example.test/releases/starter-pack.zip.sha256");
  });

  it("redirects back to /downloads when the starter pack is not configured", async () => {
    getDownloadsEnvMock.mockReturnValue({
      STARTER_PACK_URL: undefined,
      STARTER_PACK_USERNAME: undefined,
      STARTER_PACK_PASSWORD: undefined,
    });

    const response = await GET(new Request("https://cms.example.test/downloads/client/checksum"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://cms.example.test/downloads");
  });
});
