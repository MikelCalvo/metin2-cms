import "server-only";

import { isIP } from "node:net";

import { IPDox, type IPDOXResponse } from "node-ipdox";

import type { IpGeoLookup } from "@/lib/ip-geo/types";

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

function normalizeOptionalString(value: string | null | undefined) {
  const trimmedValue = value?.trim();
  return trimmedValue ? trimmedValue : null;
}

function mapIpGeoResponse(response: IPDOXResponse | undefined): IpGeoLookup | null {
  if (!response) {
    return null;
  }

  const countryCode = response.country?.toUpperCase();

  if (!countryCode || !/^[A-Z]{2}$/.test(countryCode)) {
    return null;
  }

  return {
    countryCode,
    city: normalizeOptionalString(response.city),
    postalCode: normalizeOptionalString(response.zip),
    isp: normalizeOptionalString(response.isp),
    timeZone: normalizeOptionalString(response.timeZone),
    source: normalizeOptionalString(response.source),
    proxy: response.proxy ?? null,
    hosting: response.isHosting ?? null,
    vpn: response.proxyInfo?.isVPN ?? null,
    tor: response.proxyInfo?.isTOR ?? null,
  };
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
    return mapIpGeoResponse(response);
  } catch {
    return null;
  }
}
