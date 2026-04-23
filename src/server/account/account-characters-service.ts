import "server-only";

import { sanitizeDisplayText, sanitizeOptionalDisplayText } from "@/lib/display-text";
import { defaultLocale, type Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { formatCharacterClassLabel } from "@/server/rankings/rankings-formatters";

import {
  hasAccountCharactersDbConfigured,
  listAccountCharacterRows,
} from "@/server/account/account-characters-repository";
import type { AccountCharactersOverview } from "@/server/account/account-characters-types";

export async function getAccountCharactersOverview(
  accountId: number,
  locale: Locale = defaultLocale,
): Promise<AccountCharactersOverview> {
  const messages = getMessages(locale);

  if (!hasAccountCharactersDbConfigured()) {
    return {
      status: "unavailable",
      reason: "not_configured",
      message: messages.serverMessages.accountCharactersNotConfigured,
    };
  }

  try {
    const rows = await listAccountCharacterRows(accountId);

    return {
      status: "available",
      characters: rows.map((row) => ({
        ...row,
        name: sanitizeDisplayText(row.name),
        guildName: sanitizeOptionalDisplayText(row.guildName),
        classLabel: formatCharacterClassLabel(row.job, locale),
      })),
    };
  } catch (error) {
    console.error("Failed to load account characters", error);

    return {
      status: "unavailable",
      reason: "query_failed",
      message: messages.serverMessages.accountCharactersTemporarilyUnavailable,
    };
  }
}
