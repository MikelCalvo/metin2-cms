import { beforeEach, describe, expect, it, vi } from "vitest";

const { doxIPMock } = vi.hoisted(() => ({
  doxIPMock: vi.fn(),
}));

vi.mock("node-ipdox", () => ({
  IPDox: class {
    doxIP = doxIPMock;
  },
}));

import { lookupIpGeo } from "@/server/ip-geo/ip-geo-service";

describe("ip geo service", () => {
  beforeEach(() => {
    doxIPMock.mockReset();
  });

  it("skips remote geo lookups for private and loopback addresses", async () => {
    await expect(lookupIpGeo("127.0.0.1")).resolves.toBeNull();
    await expect(lookupIpGeo("10.0.0.2")).resolves.toBeNull();
    await expect(lookupIpGeo("192.168.1.20")).resolves.toBeNull();
    await expect(lookupIpGeo("0:0:0:0:0:0:0:1")).resolves.toBeNull();
    await expect(lookupIpGeo("::ffff:127.0.0.1")).resolves.toBeNull();
    await expect(lookupIpGeo("::ffff:10.0.0.2")).resolves.toBeNull();

    expect(doxIPMock).not.toHaveBeenCalled();
  });

  it("returns a normalized country code for public addresses", async () => {
    doxIPMock.mockResolvedValue({ country: "us" });

    await expect(lookupIpGeo("8.8.8.8")).resolves.toEqual({ countryCode: "US" });
    expect(doxIPMock).toHaveBeenCalledWith({ ip: "8.8.8.8" });
  });

  it("fails closed when the provider throws", async () => {
    doxIPMock.mockRejectedValue(new Error("timeout"));

    await expect(lookupIpGeo("1.1.1.1")).resolves.toBeNull();
  });
});
