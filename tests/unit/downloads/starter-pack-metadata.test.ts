import { beforeEach, describe, expect, it, vi } from "vitest";

const { getDownloadsEnvMock } = vi.hoisted(() => ({
  getDownloadsEnvMock: vi.fn(),
}));

vi.mock("@/lib/env", () => ({
  getDownloadsEnv: getDownloadsEnvMock,
}));

import { getStarterPackReleaseMetadata } from "@/server/downloads/starter-pack-metadata";

describe("starter-pack release metadata", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    getDownloadsEnvMock.mockReset();
  });

  it("returns parsed release metadata from the protected upstream HEAD response", async () => {
    getDownloadsEnvMock.mockReturnValue({
      STARTER_PACK_URL: "https://downloads.example.test/releases/Metin2-Starter-Pack.zip",
      STARTER_PACK_USERNAME: "launcher",
      STARTER_PACK_PASSWORD: "secret",
    });

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(null, {
        status: 200,
        headers: {
          "content-length": "536870912",
          etag: '"release-2026-04-22"',
          "last-modified": "Wed, 22 Apr 2026 03:00:00 GMT",
        },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(getStarterPackReleaseMetadata()).resolves.toEqual({
      filename: "Metin2-Starter-Pack.zip",
      buildTag: "release-2026-04-22",
      fileSizeBytes: 536870912,
      updatedAt: "Wed, 22 Apr 2026 03:00:00 GMT",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://downloads.example.test/releases/Metin2-Starter-Pack.zip",
      expect.objectContaining({
        method: "HEAD",
        headers: expect.objectContaining({
          authorization: "Basic bGF1bmNoZXI6c2VjcmV0",
        }),
      }),
    );
  });

  it("falls back to archive name when the HEAD request fails", async () => {
    getDownloadsEnvMock.mockReturnValue({
      STARTER_PACK_URL: "https://downloads.example.test/releases/Metin2-Starter-Pack.zip",
      STARTER_PACK_USERNAME: undefined,
      STARTER_PACK_PASSWORD: undefined,
    });

    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("boom")));

    await expect(getStarterPackReleaseMetadata()).resolves.toEqual({
      filename: "Metin2-Starter-Pack.zip",
      buildTag: null,
      fileSizeBytes: null,
      updatedAt: null,
    });
  });

  it("returns null when no starter-pack URL is configured", async () => {
    getDownloadsEnvMock.mockReturnValue({
      STARTER_PACK_URL: undefined,
      STARTER_PACK_USERNAME: undefined,
      STARTER_PACK_PASSWORD: undefined,
    });

    await expect(getStarterPackReleaseMetadata()).resolves.toBeNull();
  });
});
