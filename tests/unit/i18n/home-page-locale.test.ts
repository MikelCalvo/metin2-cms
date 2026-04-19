import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const { cookiesMock } = vi.hoisted(() => ({
  cookiesMock: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: cookiesMock,
}));

import Home from "@/app/page";

describe("home page locale", () => {
  it("renders the public landing copy in spanish when the locale cookie is es", async () => {
    cookiesMock.mockResolvedValue({
      get: (name: string) =>
        name === "mt2-locale" ? { value: "es" } : undefined,
    });

    const html = renderToStaticMarkup(await Home());

    expect(html).toContain("Entra al servidor.");
    expect(html).toContain("Empieza a escalar.");
    expect(html).toContain("Las rutas que importan");
    expect(html).toContain("Descargar launcher");
    expect(html).not.toContain("Enter the server.");
  });
});
