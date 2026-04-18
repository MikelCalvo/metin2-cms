import { formatAccountEventTimestamp } from "@/lib/account-ui-formatters";

import type { RankingTimestamp } from "@/server/rankings/types";

function padDateSegment(value: number) {
  return `${value}`.padStart(2, "0");
}

function normalizeRankingTimestamp(mysqlDateTime: Exclude<RankingTimestamp, null>) {
  if (typeof mysqlDateTime === "string") {
    return mysqlDateTime;
  }

  if (Number.isNaN(mysqlDateTime.getTime())) {
    return null;
  }

  const year = mysqlDateTime.getFullYear();
  const month = padDateSegment(mysqlDateTime.getMonth() + 1);
  const day = padDateSegment(mysqlDateTime.getDate());
  const hours = padDateSegment(mysqlDateTime.getHours());
  const minutes = padDateSegment(mysqlDateTime.getMinutes());
  const seconds = padDateSegment(mysqlDateTime.getSeconds());

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

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

export function formatRankingTimestamp(mysqlDateTime: RankingTimestamp | undefined, now = new Date()) {
  if (!mysqlDateTime) {
    return "—";
  }

  const normalizedTimestamp = normalizeRankingTimestamp(mysqlDateTime);

  if (!normalizedTimestamp || normalizedTimestamp === "0000-00-00 00:00:00") {
    return "—";
  }

  return formatAccountEventTimestamp(normalizedTimestamp, now);
}
