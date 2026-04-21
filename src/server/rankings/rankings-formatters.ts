import { defaultLocale, type Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { formatRelativeMysqlTimestamp } from "@/lib/time/mysql-timestamps";
import type { RankingTimestamp } from "@/server/rankings/types";

export function formatCharacterClassLabel(job: number, locale: Locale = defaultLocale) {
  const classes = getMessages(locale).rankingsMeta.classes;

  if (job === 0 || job === 1) {
    return classes.warrior;
  }

  if (job === 2 || job === 3) {
    return classes.ninja;
  }

  if (job === 4 || job === 5) {
    return classes.sura;
  }

  if (job === 6 || job === 7) {
    return classes.shaman;
  }

  if (job === 8) {
    return classes.lycan;
  }

  return classes.unknown;
}

export function formatPlaytimeDuration(playtimeMinutes: number, locale = defaultLocale) {
  const numberFormat = new Intl.NumberFormat(locale);
  const hours = Math.floor(playtimeMinutes / 60);
  const minutes = playtimeMinutes % 60;

  if (hours > 0 && minutes > 0) {
    return `${numberFormat.format(hours)}h ${numberFormat.format(minutes)}m`;
  }

  if (hours > 0) {
    return `${numberFormat.format(hours)}h`;
  }

  return `${numberFormat.format(minutes)}m`;
}

export function formatRankingTimestamp(
  mysqlDateTime: RankingTimestamp | undefined,
  now = new Date(),
  locale: Locale = defaultLocale,
) {
  return formatRelativeMysqlTimestamp(mysqlDateTime, now, locale);
}
