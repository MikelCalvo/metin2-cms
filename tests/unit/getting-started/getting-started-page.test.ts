import { describe, expect, it, vi } from "vitest";

const { redirectMock } = vi.hoisted(() => ({
  redirectMock: vi.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

import GettingStartedPage from "@/app/getting-started/page";

describe("getting started page", () => {
  it("redirects the retired start-playing route back to downloads", () => {
    expect(() => GettingStartedPage()).toThrow("NEXT_REDIRECT");
    expect(redirectMock).toHaveBeenCalledWith("/downloads");
  });
});
