import "server-only";

import { isIP } from "node:net";

import type { AccountAuthActivityEntry } from "@/server/auth/auth-audit-service";

export function findPreviousSuccessfulSignIn(
  entries: AccountAuthActivityEntry[],
  currentSessionCreatedAt?: string | null,
) {
  const successfulSignIns = entries.filter(
    (entry) => entry.eventType === "login" && entry.success,
  );

  if (successfulSignIns.length === 0) {
    return null;
  }

  const candidateSuccessfulSignIns = currentSessionCreatedAt
    ? successfulSignIns.filter((entry) => entry.occurredAt < currentSessionCreatedAt)
    : successfulSignIns.slice(1);

  for (const entry of candidateSuccessfulSignIns) {
    const ip = entry.ip?.trim();

    if (!ip || !isIP(ip)) {
      continue;
    }

    if (ip.includes(":")) {
      const normalizedIp = ip.toLowerCase();
      const mappedIpv4 = normalizedIp.startsWith("::ffff:") ? normalizedIp.slice(7) : null;
      const isLoopbackIpv6 = normalizedIp === "::1" || normalizedIp === "0:0:0:0:0:0:0:1";
      const isPrivateMappedIpv4 =
        mappedIpv4 !== null &&
        isIP(mappedIpv4) === 4 &&
        (mappedIpv4.startsWith("10.") ||
          mappedIpv4.startsWith("127.") ||
          mappedIpv4.startsWith("192.168.") ||
          /^172\.(1[6-9]|2\d|3[0-1])\./.test(mappedIpv4));
      const isPrivateIpv6 =
        normalizedIp.startsWith("fc") || normalizedIp.startsWith("fd") || normalizedIp.startsWith("fe80:");

      if (isLoopbackIpv6 || isPrivateMappedIpv4 || isPrivateIpv6) {
        continue;
      }
    } else if (
      ip.startsWith("10.") ||
      ip.startsWith("127.") ||
      ip.startsWith("192.168.") ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(ip)
    ) {
      continue;
    }

    return entry;
  }

  return null;
}
