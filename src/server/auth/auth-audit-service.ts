import "server-only";

import type { AuthAuditLogEntry } from "@/lib/db/schema/cms";
import { listRecentAuthAuditEntriesForAccount } from "@/server/auth/auth-audit-repository";

const DEFAULT_ACTIVITY_LIMIT = 10;
const MAX_ACTIVITY_LIMIT = 20;

type AuthActivityDescriptor = {
  title: string;
  description: string;
};

export type AccountAuthActivityEntry = {
  id: number;
  eventType: string;
  outcome: string;
  occurredAt: string;
  success: boolean;
  ip: string | null;
  userAgent: string | null;
  deliveryMode: string | null;
  title: string;
  description: string;
};

function normalizeLimit(limit = DEFAULT_ACTIVITY_LIMIT) {
  return Math.min(Math.max(limit, 1), MAX_ACTIVITY_LIMIT);
}

function parseAuditDetail(detail: string | null) {
  const values = new Map<string, string>();

  for (const part of detail?.split(";") ?? []) {
    const [rawKey, ...rawValue] = part.split("=");

    if (!rawKey || rawValue.length === 0) {
      continue;
    }

    values.set(rawKey, rawValue.join("="));
  }

  return {
    outcome: values.get("outcome") ?? "unknown",
    deliveryMode: values.get("delivery") ?? null,
  };
}

function describeActivity(entry: AuthAuditLogEntry, outcome: string): AuthActivityDescriptor {
  if (entry.eventType === "login" && outcome === "authenticated") {
    return {
      title: "Successful sign-in",
      description: "The account signed in successfully.",
    };
  }

  if (entry.eventType === "login" && outcome === "invalid_credentials") {
    return {
      title: "Failed sign-in",
      description: "Someone entered an invalid password for this account.",
    };
  }

  if (entry.eventType === "login" && outcome === "account_unavailable") {
    return {
      title: "Blocked sign-in",
      description: "A sign-in was denied because the account is not available.",
    };
  }

  if (entry.eventType === "password_recovery.request" && outcome === "token_created") {
    return {
      title: "Recovery requested",
      description: "A password recovery link was generated for this account.",
    };
  }

  if (
    entry.eventType === "password_recovery.request" &&
    outcome === "login_email_mismatch_or_unavailable"
  ) {
    return {
      title: "Failed recovery request",
      description: "A password recovery attempt did not match the account details.",
    };
  }

  if (entry.eventType === "password_recovery.reset" && outcome === "password_updated") {
    return {
      title: "Password updated",
      description: "The account password was changed with a recovery link.",
    };
  }

  return {
    title: "Authentication event",
    description: `${entry.eventType} (${outcome})`,
  };
}

export async function listRecentAuthActivityForAccount(
  accountId: number,
  limit = DEFAULT_ACTIVITY_LIMIT,
): Promise<AccountAuthActivityEntry[]> {
  const entries = await listRecentAuthAuditEntriesForAccount(
    accountId,
    normalizeLimit(limit),
  );

  return entries.map((entry) => {
    const detail = parseAuditDetail(entry.detail);
    const descriptor = describeActivity(entry, detail.outcome);

    return {
      id: entry.id,
      eventType: entry.eventType,
      outcome: detail.outcome,
      occurredAt: entry.createdAt,
      success: entry.success === 1,
      ip: entry.ip ?? null,
      userAgent: entry.userAgent ?? null,
      deliveryMode: detail.deliveryMode,
      title: descriptor.title,
      description: descriptor.description,
    };
  });
}
