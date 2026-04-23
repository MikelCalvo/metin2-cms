import "server-only";

import { sanitizeDisplayText, sanitizeOptionalDisplayText } from "@/lib/display-text";
import { defaultLocale, type Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
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
  outcomeLabel?: string;
  occurredAt: string;
  success: boolean;
  ip: string | null;
  userAgent: string | null;
  deliveryMode: string | null;
  deliveryModeLabel?: string | null;
  title: string;
  description: string;
};

function normalizeLimit(limit = DEFAULT_ACTIVITY_LIMIT) {
  return Math.min(Math.max(limit, 1), MAX_ACTIVITY_LIMIT);
}

function normalizeOffset(offset = 0) {
  return Math.max(offset, 0);
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

function describeActivity(
  entry: AuthAuditLogEntry,
  outcome: string,
  locale: Locale,
): AuthActivityDescriptor {
  const descriptors = getMessages(locale).activity.descriptors;

  if (entry.eventType === "login" && outcome === "authenticated") {
    return {
      title: descriptors.successfulSignInTitle,
      description: descriptors.successfulSignInDescription,
    };
  }

  if (entry.eventType === "login" && outcome === "invalid_credentials") {
    return {
      title: descriptors.failedSignInTitle,
      description: descriptors.failedSignInDescription,
    };
  }

  if (entry.eventType === "login" && outcome === "account_unavailable") {
    return {
      title: descriptors.blockedSignInTitle,
      description: descriptors.blockedSignInDescription,
    };
  }

  if (entry.eventType === "password_recovery.request" && outcome === "token_created") {
    return {
      title: descriptors.recoveryRequestedTitle,
      description: descriptors.recoveryRequestedDescription,
    };
  }

  if (
    entry.eventType === "password_recovery.request" &&
    outcome === "login_email_mismatch_or_unavailable"
  ) {
    return {
      title: descriptors.recoveryFailedTitle,
      description: descriptors.recoveryFailedDescription,
    };
  }

  if (entry.eventType === "password_recovery.reset" && outcome === "password_updated") {
    return {
      title: descriptors.recoveryPasswordUpdatedTitle,
      description: descriptors.recoveryPasswordUpdatedDescription,
    };
  }

  if (entry.eventType === "account.password_change" && outcome === "password_updated") {
    return {
      title: descriptors.accountPasswordChangedTitle,
      description: descriptors.accountPasswordChangedDescription,
    };
  }

  if (entry.eventType === "account.profile_update" && outcome === "profile_updated") {
    return {
      title: descriptors.accountProfileUpdatedTitle,
      description: descriptors.accountProfileUpdatedDescription,
    };
  }

  return {
    title: descriptors.fallbackTitle,
    description: descriptors.fallbackDescription(entry.eventType, outcome),
  };
}

export async function listRecentAuthActivityForAccount(
  accountId: number,
  limit = DEFAULT_ACTIVITY_LIMIT,
  offset = 0,
  locale: Locale = defaultLocale,
): Promise<AccountAuthActivityEntry[]> {
  const entries = await listRecentAuthAuditEntriesForAccount(
    accountId,
    normalizeLimit(limit),
    normalizeOffset(offset),
  );
  const messages = getMessages(locale);

  return entries.map((entry) => {
    const detail = parseAuditDetail(entry.detail);
    const descriptor = describeActivity(entry, detail.outcome, locale);
    const outcomeLabel =
      locale === defaultLocale
        ? undefined
        : messages.activity.outcomeLabels[
            detail.outcome as keyof typeof messages.activity.outcomeLabels
          ] ?? messages.activity.outcomeLabels.unknown;
    const deliveryModeLabel =
      locale === defaultLocale
        ? null
        : detail.deliveryMode
          ? messages.activity.deliveryLabels[
              detail.deliveryMode as keyof typeof messages.activity.deliveryLabels
            ] ?? detail.deliveryMode
          : null;

    return {
      id: entry.id,
      eventType: sanitizeDisplayText(entry.eventType),
      outcome: sanitizeDisplayText(detail.outcome),
      ...(outcomeLabel ? { outcomeLabel: sanitizeDisplayText(outcomeLabel) } : {}),
      occurredAt: entry.createdAt,
      success: entry.success === 1,
      ip: sanitizeOptionalDisplayText(entry.ip),
      userAgent: sanitizeOptionalDisplayText(entry.userAgent),
      deliveryMode: sanitizeOptionalDisplayText(detail.deliveryMode),
      ...(deliveryModeLabel ? { deliveryModeLabel: sanitizeDisplayText(deliveryModeLabel) } : {}),
      title: sanitizeDisplayText(descriptor.title),
      description: sanitizeDisplayText(descriptor.description),
    };
  });
}
