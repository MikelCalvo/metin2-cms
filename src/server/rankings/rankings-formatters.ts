import {
  formatRelativeMysqlTimestamp,
} from "@/lib/time/mysql-timestamps";
import type { RankingTimestamp } from "@/server/rankings/types";

export function formatCharacterClassLabel(job: number) {
  if (job === 0 || job === 1) {
    return "Warrior";
  }

  if (job === 2 || job === 3) {
    return "Ninja";
  }

  if (job === 4 || job === 5) {
    return "Sura";
  }

  if (job === 6 || job === 7) {
    return "Shaman";
  }

  if (job === 8) {
    return "Lycan";
  }

  return "Unknown";
}

export function formatRankingTimestamp(
  mysqlDateTime: RankingTimestamp | undefined,
  now = new Date(),
) {
  return formatRelativeMysqlTimestamp(mysqlDateTime, now);
}
