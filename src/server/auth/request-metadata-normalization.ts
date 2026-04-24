import type { RequestMetadata } from "@/server/auth/types";

const REQUEST_METADATA_CONTROL_AND_INVISIBLE_CHARACTERS =
  /[\u0000-\u001F\u007F-\u009F\u202A-\u202E\u2066-\u2069]/g;
const REQUEST_METADATA_COLLAPSIBLE_WHITESPACE = /\s+/g;

export const REQUEST_IP_MAX_LENGTH = 255;
export const REQUEST_USER_AGENT_MAX_LENGTH = 512;

function normalizeRequestMetadataValue(
  value: string | null | undefined,
  maxLength: number,
) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value
    .replace(REQUEST_METADATA_COLLAPSIBLE_WHITESPACE, " ")
    .replace(REQUEST_METADATA_CONTROL_AND_INVISIBLE_CHARACTERS, "")
    .trim()
    .slice(0, maxLength);

  return normalized.length > 0 ? normalized : null;
}

function normalizeRequestIp(value: string | null | undefined) {
  if (typeof value !== "string") {
    return null;
  }

  const firstForwardedValue = value.split(",")[0] ?? value;
  return normalizeRequestMetadataValue(firstForwardedValue, REQUEST_IP_MAX_LENGTH);
}

export function normalizeRequestMetadata(
  metadata: RequestMetadata = {},
): Required<RequestMetadata> {
  return {
    ip: normalizeRequestIp(metadata.ip),
    userAgent: normalizeRequestMetadataValue(
      metadata.userAgent,
      REQUEST_USER_AGENT_MAX_LENGTH,
    ),
  };
}
