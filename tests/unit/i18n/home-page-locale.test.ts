import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { cookiesMock, getRankingOverviewMock } = vi.hoisted(() => ({
  cookiesMock: vi.fn(),
  getRankingOverviewMock: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: cookiesMock,
}));

vi.mock("@/server/rankings/rankings-service", () => ({
  getRankingOverview: getRankingOverviewMock,
}));

import Home from "@/app/page";

describe("home page locale", () => {
  beforeEach(() => {
    getRankingOverviewMock.mockReset();
  });

  it("renders the public landing copy in spanish when the locale cookie is es", async () => {
    cookiesMock.mockResolvedValue({
      get: (name: string) =>
        name === "mt2-locale" ? { value: "es" } : undefined,
    });
    getRankingOverviewMock.mockResolvedValueOnce({
      status: "available",
      players: [],
      guilds: [],
    });

    const html = renderToStaticMarkup(await Home());

    expect(html).toContain("Entra al servidor.");
    expect(html).toContain("Empieza a escalar.");
    expect(html).toContain("Vida del servidor, ahora mismo");
    expect(html).toContain("Las rutas que importan");
    expect(html).toContain("Descargar launcher");
    expect(html).not.toContain("Enter the server.");
  });
});
