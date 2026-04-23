import "server-only";

import { sanitizeDisplayText, sanitizeOptionalDisplayText } from "@/lib/display-text";
import { defaultLocale, type Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import {
  hasPlayerRankingDbConfigured,
  listTopGuildRankingRows,
  listTopPlayerRankingRows,
} from "@/server/rankings/rankings-repository";
import { formatCharacterClassLabel } from "@/server/rankings/rankings-formatters";
import type { RankingOverview } from "@/server/rankings/types";

export const PLAYER_RANKING_LIMIT = 100;
export const GUILD_RANKING_LIMIT = 10;

export async function getRankingOverview(
  locale: Locale = defaultLocale,
): Promise<RankingOverview> {
  const messages = getMessages(locale);

  if (!hasPlayerRankingDbConfigured()) {
    return {
      status: "unavailable",
      reason: "not_configured",
      message: messages.serverMessages.rankingsNotConfigured,
    };
  }

  try {
    const [playerRows, guildRows] = await Promise.all([
      listTopPlayerRankingRows(PLAYER_RANKING_LIMIT),
      listTopGuildRankingRows(GUILD_RANKING_LIMIT),
    ]);

    return {
      status: "available",
      players: playerRows.map((row, index) => ({
        ...row,
        name: sanitizeDisplayText(row.name),
        guildName: sanitizeOptionalDisplayText(row.guildName),
        rank: index + 1,
        classLabel: formatCharacterClassLabel(row.job, locale),
      })),
      guilds: guildRows.map((row, index) => ({
        ...row,
        name: sanitizeDisplayText(row.name),
        rank: index + 1,
      })),
    };
  } catch (error) {
    console.error("Failed to load ranking overview", error);

    return {
      status: "unavailable",
      reason: "query_failed",
      message: messages.serverMessages.rankingsTemporarilyUnavailable,
    };
  }
}
