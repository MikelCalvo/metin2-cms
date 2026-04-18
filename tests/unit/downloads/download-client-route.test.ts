import { beforeEach, describe, expect, it, vi } from "vitest";

const { getPublicEnvMock } = vi.hoisted(() => ({
  getPublicEnvMock: vi.fn(),
}));

vi.mock("@/lib/env", () => ({
  getPublicEnv: getPublicEnvMock,
}));

import { GET } from "@/app/downloads/client/route";

describe("downloads client route", () => {
  beforeEach(() => {
    getPublicEnvMock.mockReset();
  });

  it("redirects to the configured starter-pack URL", async () => {
    getPublicEnvMock.mockReturnValue({
      STARTER_PACK_URL: "https://downloads.example.test/releases/starter-pack.zip",
    });

    const response = await GET(new Request("https://cms.example.test/downloads/client"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://downloads.example.test/releases/starter-pack.zip");
  });

  it("redirects back to /downloads when the starter pack is not configured", async () => {
    getPublicEnvMock.mockReturnValue({
      STARTER_PACK_URL: undefined,
    });

    const response = await GET(new Request("https://cms.example.test/downloads/client"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://cms.example.test/downloads");
  });
});
