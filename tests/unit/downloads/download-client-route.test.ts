import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { getDownloadsEnvMock } = vi.hoisted(() => ({
  getDownloadsEnvMock: vi.fn(),
}));

vi.mock("@/lib/env", () => ({
  getDownloadsEnv: getDownloadsEnvMock,
}));

import { GET } from "@/app/downloads/client/route";

describe("downloads client route", () => {
  beforeEach(() => {
    getDownloadsEnvMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("proxies the starter pack through the CMS with basic auth when credentials are configured", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response("zip-body", {
        status: 200,
        headers: {
          "content-type": "application/zip",
          "content-length": "8",
          "content-disposition": 'attachment; filename="Metin2-Starter-Pack.zip"',
        },
      }),
    );

    vi.stubGlobal("fetch", fetchMock);

    getDownloadsEnvMock.mockReturnValue({
      STARTER_PACK_URL: "https://downloads.example.test/releases/starter-pack.zip",
      STARTER_PACK_USERNAME: "mt2update",
      STARTER_PACK_PASSWORD: "super-secret",
    });

    const response = await GET(new Request("https://cms.example.test/downloads/client"));

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("application/zip");
    expect(response.headers.get("content-disposition")).toBe('attachment; filename="Metin2-Starter-Pack.zip"');
    await expect(response.text()).resolves.toBe("zip-body");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://downloads.example.test/releases/starter-pack.zip",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          authorization: `Basic ${Buffer.from("mt2update:super-secret").toString("base64")}`,
        }),
      }),
    );
  });

  it("forwards range headers and preserves partial-content responses for resumable downloads", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response("PK", {
        status: 206,
        headers: {
          "content-type": "application/zip",
          "content-length": "2",
          "content-disposition": 'attachment; filename="Metin2-Starter-Pack.zip"',
          "content-range": "bytes 0-1/1049126372",
          "accept-ranges": "bytes",
        },
      }),
    );

    vi.stubGlobal("fetch", fetchMock);

    getDownloadsEnvMock.mockReturnValue({
      STARTER_PACK_URL: "https://downloads.example.test/releases/starter-pack.zip",
      STARTER_PACK_USERNAME: "mt2update",
      STARTER_PACK_PASSWORD: "super-secret",
    });

    const response = await GET(
      new Request("https://cms.example.test/downloads/client", {
        headers: {
          Range: "bytes=0-1",
          "If-Range": '"starter-pack-etag"',
        },
      }),
    );

    expect(response.status).toBe(206);
    expect(response.headers.get("content-range")).toBe("bytes 0-1/1049126372");
    expect(response.headers.get("accept-ranges")).toBe("bytes");
    await expect(response.text()).resolves.toBe("PK");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://downloads.example.test/releases/starter-pack.zip",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          authorization: `Basic ${Buffer.from("mt2update:super-secret").toString("base64")}`,
          range: "bytes=0-1",
          "if-range": '"starter-pack-etag"',
        }),
      }),
    );
  });

  it("redirects directly to the starter-pack URL when auth credentials are not configured", async () => {
    getDownloadsEnvMock.mockReturnValue({
      STARTER_PACK_URL: "https://downloads.example.test/releases/starter-pack.zip",
      STARTER_PACK_USERNAME: undefined,
      STARTER_PACK_PASSWORD: undefined,
    });

    const response = await GET(new Request("https://cms.example.test/downloads/client"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://downloads.example.test/releases/starter-pack.zip");
  });

  it("redirects back to /downloads when the starter pack is not configured", async () => {
    getDownloadsEnvMock.mockReturnValue({
      STARTER_PACK_URL: undefined,
      STARTER_PACK_USERNAME: undefined,
      STARTER_PACK_PASSWORD: undefined,
    });

    const response = await GET(new Request("https://cms.example.test/downloads/client"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://cms.example.test/downloads");
  });
});
