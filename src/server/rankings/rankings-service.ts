import "server-only";

import {
  hasPlayerRankingDbConfigured,
  listTopGuildRankingRows,
  listTopPlayerRankingRows,
} from "@/server/rankings/rankings-repository";
import { formatCharacterClassLabel } from "@/server/rankings/rankings-formatters";
import type { RankingOverview } from "@/server/rankings/types";

export const PLAYER_RANKING_LIMIT = 100;
export const GUILD_RANKING_LIMIT = 10;

export async function getRankingOverview(): Promise<RankingOverview> {
  if (!hasPlayerRankingDbConfigured()) {
    return {
      status: "unavailable",
      reason: "not_configured",
      message: "Rankings are not configured yet.",
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
        rank: index + 1,
        classLabel: formatCharacterClassLabel(row.job),
      })),
      guilds: guildRows.map((row, index) => ({
        ...row,
        rank: index + 1,
      })),
    };
  } catch (error) {
    console.error("Failed to load ranking overview", error);

    return {
      status: "unavailable",
      reason: "query_failed",
      message: "Rankings are temporarily unavailable.",
    };
  }
}
