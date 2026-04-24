import "server-only";

import { headers } from "next/headers";

import { normalizeRequestMetadata } from "@/server/auth/request-metadata-normalization";
import type { RequestMetadata } from "@/server/auth/types";

export async function getRequestMetadata(): Promise<RequestMetadata> {
  const requestHeaders = await headers();

  return normalizeRequestMetadata({
    ip: requestHeaders.get("x-forwarded-for") ?? requestHeaders.get("x-real-ip"),
    userAgent: requestHeaders.get("user-agent"),
  });
}
