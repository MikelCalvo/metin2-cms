import "server-only";

import { headers } from "next/headers";

import type { RequestMetadata } from "@/server/auth/types";

export async function getRequestMetadata(): Promise<RequestMetadata> {
  const requestHeaders = await headers();
  const forwardedFor = requestHeaders.get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0]?.trim() ?? requestHeaders.get("x-real-ip");

  return {
    ip: ip || null,
    userAgent: requestHeaders.get("user-agent"),
  };
}
