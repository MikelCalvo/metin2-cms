import "server-only";

import { getDownloadsEnv } from "@/lib/env";

export type StarterPackReleaseMetadata = {
  filename: string;
  buildTag: string | null;
  fileSizeBytes: number | null;
  updatedAt: string | null;
};

function buildBasicAuthorization(username: string, password: string) {
  return `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;
}

function getFilenameFromUrl(url: string) {
  try {
    const pathname = new URL(url).pathname;
    return pathname.split("/").filter(Boolean).at(-1) ?? "download.bin";
  } catch {
    return "download.bin";
  }
}

function parseBuildTag(etag: string | null) {
  if (!etag) {
    return null;
  }

  return etag.replace(/^W\//, "").replace(/^"|"$/g, "");
}

function parseContentLength(contentLength: string | null) {
  if (!contentLength) {
    return null;
  }

  const parsed = Number.parseInt(contentLength, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function getStarterPackReleaseMetadata(): Promise<StarterPackReleaseMetadata | null> {
  const downloadsEnv = getDownloadsEnv();

  if (!downloadsEnv.STARTER_PACK_URL) {
    return null;
  }

  const filename = getFilenameFromUrl(downloadsEnv.STARTER_PACK_URL);
  const headers: Record<string, string> = {};

  if (downloadsEnv.STARTER_PACK_USERNAME && downloadsEnv.STARTER_PACK_PASSWORD) {
    headers.authorization = buildBasicAuthorization(
      downloadsEnv.STARTER_PACK_USERNAME,
      downloadsEnv.STARTER_PACK_PASSWORD,
    );
  }

  try {
    const response = await fetch(downloadsEnv.STARTER_PACK_URL, {
      method: "HEAD",
      cache: "no-store",
      headers,
    });

    if (!response.ok) {
      return {
        filename,
        buildTag: null,
        fileSizeBytes: null,
        updatedAt: null,
      };
    }

    const updatedAt = response.headers.get("last-modified");

    return {
      filename,
      buildTag: parseBuildTag(response.headers.get("etag")) ?? updatedAt,
      fileSizeBytes: parseContentLength(response.headers.get("content-length")),
      updatedAt,
    };
  } catch {
    return {
      filename,
      buildTag: null,
      fileSizeBytes: null,
      updatedAt: null,
    };
  }
}
