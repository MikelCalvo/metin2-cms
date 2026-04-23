import "server-only";

import { isIP } from "node:net";

import { IPDox } from "node-ipdox";

export type IpGeoLookup = {
  countryCode: string;
};

let ipDoxClient: InstanceType<typeof IPDox> | null = null;

function getIpDoxClient() {
  if (!ipDoxClient) {
    ipDoxClient = new IPDox({
      cacheMaxItems: 500,
      cacheMaxAge: 1000 * 60 * 60 * 12,
      maxRetries: 1,
      requestTimeoutMs: 1500,
      ipApiKey: process.env.IPDOX_API_KEY,
    });
  }

  return ipDoxClient;
}

function isPrivateIpv4(ip: string) {
  return (
    ip.startsWith("10.") ||
    ip.startsWith("127.") ||
    ip.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(ip)
  );
}

function isPrivateIpv6(ip: string) {
  const normalized = ip.toLowerCase();
  const mappedIpv4 = normalized.startsWith("::ffff:") ? normalized.slice(7) : null;

  if (normalized === "::1" || normalized === "0:0:0:0:0:0:0:1") {
    return true;
  }

  if (mappedIpv4 && isIP(mappedIpv4) === 4 && isPrivateIpv4(mappedIpv4)) {
    return true;
  }

  return normalized.startsWith("fc") || normalized.startsWith("fd") || normalized.startsWith("fe80:");
}

function normalizeIp(ip: string | null | undefined) {
  const value = ip?.trim();
  return value ? value : null;
}

export async function lookupIpGeo(ip: string | null | undefined): Promise<IpGeoLookup | null> {
  const normalizedIp = normalizeIp(ip);

  if (!normalizedIp || !isIP(normalizedIp)) {
    return null;
  }

  if (normalizedIp.includes(":")) {
    if (isPrivateIpv6(normalizedIp)) {
      return null;
    }
  } else if (isPrivateIpv4(normalizedIp)) {
    return null;
  }

  try {
    const response = await getIpDoxClient().doxIP({ ip: normalizedIp });
    const countryCode = response?.country?.toUpperCase();

    if (!countryCode || !/^[A-Z]{2}$/.test(countryCode)) {
      return null;
    }

    return { countryCode };
  } catch {
    return null;
  }
}
