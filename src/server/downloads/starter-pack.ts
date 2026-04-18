import "server-only";

import { NextResponse } from "next/server";

import { getDownloadsEnv } from "@/lib/env";

const DOWNLOADS_FALLBACK_PATH = "/downloads";
const FORWARDED_HEADERS = [
  "content-type",
  "content-length",
  "content-disposition",
  "etag",
  "last-modified",
  "accept-ranges",
  "content-range",
  "cache-control",
] as const;
const FORWARDED_REQUEST_HEADERS = ["range", "if-range"] as const;

type StarterPackAsset = "archive" | "checksum";

function getStarterPackAssetUrl(starterPackUrl: string, asset: StarterPackAsset) {
  if (asset === "checksum") {
    return `${starterPackUrl}.sha256`;
  }

  return starterPackUrl;
}

function buildBasicAuthorization(username: string, password: string) {
  return `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;
}

function buildUpstreamRequestHeaders(request: Request, username: string, password: string) {
  const headers: Record<string, string> = {
    authorization: buildBasicAuthorization(username, password),
  };

  for (const headerName of FORWARDED_REQUEST_HEADERS) {
    const headerValue = request.headers.get(headerName);

    if (headerValue) {
      headers[headerName] = headerValue;
    }
  }

  return headers;
}

function getFilenameFromUrl(url: string) {
  try {
    const pathname = new URL(url).pathname;
    return pathname.split("/").filter(Boolean).at(-1) ?? "download.bin";
  } catch {
    return "download.bin";
  }
}

function buildProxyHeaders(upstreamResponse: Response, fallbackFilename?: string) {
  const headers = new Headers();

  for (const headerName of FORWARDED_HEADERS) {
    const headerValue = upstreamResponse.headers.get(headerName);

    if (headerValue) {
      headers.set(headerName, headerValue);
    }
  }

  if (!headers.has("content-type")) {
    headers.set("content-type", fallbackFilename ? "application/octet-stream" : "text/plain; charset=utf-8");
  }

  if (fallbackFilename && !headers.has("content-disposition")) {
    headers.set("content-disposition", `attachment; filename="${fallbackFilename}"`);
  }

  return headers;
}

export async function handleStarterPackRequest(request: Request, asset: StarterPackAsset) {
  const downloadsEnv = getDownloadsEnv();

  if (!downloadsEnv.STARTER_PACK_URL) {
    return NextResponse.redirect(new URL(DOWNLOADS_FALLBACK_PATH, request.url));
  }

  const assetUrl = getStarterPackAssetUrl(downloadsEnv.STARTER_PACK_URL, asset);

  if (!downloadsEnv.STARTER_PACK_USERNAME || !downloadsEnv.STARTER_PACK_PASSWORD) {
    return NextResponse.redirect(new URL(assetUrl));
  }

  const upstreamResponse = await fetch(assetUrl, {
    method: request.method,
    cache: "no-store",
    headers: buildUpstreamRequestHeaders(
      request,
      downloadsEnv.STARTER_PACK_USERNAME,
      downloadsEnv.STARTER_PACK_PASSWORD,
    ),
  });

  if (!upstreamResponse.ok) {
    return new NextResponse(
      asset === "checksum" ? "Starter-pack checksum is temporarily unavailable." : "Starter pack is temporarily unavailable.",
      { status: 502 },
    );
  }

  return new NextResponse(upstreamResponse.body, {
    status: upstreamResponse.status,
    headers: buildProxyHeaders(
      upstreamResponse,
      asset === "archive" ? getFilenameFromUrl(downloadsEnv.STARTER_PACK_URL) : undefined,
    ),
  });
}
