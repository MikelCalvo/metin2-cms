import type { RankingTimestamp } from "@/server/rankings/types";

const relativeTimeFormatter = new Intl.RelativeTimeFormat("en", { numeric: "always" });

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

function parseRankingTimestamp(mysqlDateTime: string) {
  const match = mysqlDateTime.match(
    /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})(?::(\d{2}))?$/,
  );

  if (!match) {
    return null;
  }

  const [, year, month, day, hours, minutes, seconds = "00"] = match;
  const parsedYear = Number(year);
  const parsedMonth = Number(month);
  const parsedDay = Number(day);
  const parsedHours = Number(hours);
  const parsedMinutes = Number(minutes);
  const parsedSeconds = Number(seconds);
  const date = new Date(parsedYear, parsedMonth - 1, parsedDay, parsedHours, parsedMinutes, parsedSeconds);

  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== parsedYear ||
    date.getMonth() !== parsedMonth - 1 ||
    date.getDate() !== parsedDay ||
    date.getHours() !== parsedHours ||
    date.getMinutes() !== parsedMinutes ||
    date.getSeconds() !== parsedSeconds
  ) {
    return null;
  }

  return date;
}

function getWholeMonthDifference(earlier: Date, later: Date) {
  let months = (later.getFullYear() - earlier.getFullYear()) * 12 + (later.getMonth() - earlier.getMonth());

  if (
    later.getDate() < earlier.getDate() ||
    (later.getDate() === earlier.getDate() &&
      (later.getHours() < earlier.getHours() ||
        (later.getHours() === earlier.getHours() &&
          (later.getMinutes() < earlier.getMinutes() ||
            (later.getMinutes() === earlier.getMinutes() && later.getSeconds() < earlier.getSeconds())))))
  ) {
    months -= 1;
  }

  return Math.max(months, 0);
}

function formatRelativeRankingTimestamp(timestamp: Date, now: Date) {
  const diffMs = now.getTime() - timestamp.getTime();
  const absoluteDiffMs = Math.abs(diffMs);
  const direction = diffMs < 0 ? 1 : -1;
  const earlier = diffMs < 0 ? now : timestamp;
  const later = diffMs < 0 ? timestamp : now;

  if (absoluteDiffMs <= 5 * 60 * 1000) {
    return "Online";
  }

  const diffMinutes = Math.floor(absoluteDiffMs / (60 * 1000));

  if (diffMinutes < 60) {
    return relativeTimeFormatter.format(direction * diffMinutes, "minute");
  }

  const diffHours = Math.floor(absoluteDiffMs / (60 * 60 * 1000));

  if (diffHours < 24) {
    return relativeTimeFormatter.format(direction * diffHours, "hour");
  }

  const diffDays = Math.floor(absoluteDiffMs / (24 * 60 * 60 * 1000));

  if (diffDays < 30) {
    return relativeTimeFormatter.format(direction * diffDays, "day");
  }

  const diffMonths = Math.max(getWholeMonthDifference(earlier, later), 1);

  if (diffDays < 365) {
    return relativeTimeFormatter.format(direction * diffMonths, "month");
  }

  const diffYears = Math.max(Math.floor(diffMonths / 12), 1);

  return relativeTimeFormatter.format(direction * diffYears, "year");
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

  const parsedTimestamp = parseRankingTimestamp(normalizedTimestamp);

  if (!parsedTimestamp) {
    return "—";
  }

  return formatRelativeRankingTimestamp(parsedTimestamp, now);
}
