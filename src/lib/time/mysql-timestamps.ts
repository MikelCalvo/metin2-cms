import { defaultLocale, getIntlLocale, type Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";

function padDateSegment(value: number) {
  return `${value}`.padStart(2, "0");
}

function getDateKey(date: Date) {
  const year = date.getFullYear();
  const month = padDateSegment(date.getMonth() + 1);
  const day = padDateSegment(date.getDate());

  return `${year}-${month}-${day}`;
}

function getTimeLabel(mysqlDateTime: string) {
  return mysqlDateTime.slice(11, 16);
}

function getWholeMonthDifference(earlier: Date, later: Date) {
  let months =
    (later.getFullYear() - earlier.getFullYear()) * 12 +
    (later.getMonth() - earlier.getMonth());

  if (
    later.getDate() < earlier.getDate() ||
    (later.getDate() === earlier.getDate() &&
      (later.getHours() < earlier.getHours() ||
        (later.getHours() === earlier.getHours() &&
          (later.getMinutes() < earlier.getMinutes() ||
            (later.getMinutes() === earlier.getMinutes() &&
              later.getSeconds() < earlier.getSeconds())))))
  ) {
    months -= 1;
  }

  return Math.max(months, 0);
}

export function normalizeMysqlTimestamp(mysqlDateTime: string | Date | null | undefined) {
  if (!mysqlDateTime) {
    return null;
  }

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

export function parseMysqlDateTime(mysqlDateTime: string) {
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
  const date = new Date(
    parsedYear,
    parsedMonth - 1,
    parsedDay,
    parsedHours,
    parsedMinutes,
    parsedSeconds,
  );

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

export function formatRelativeMysqlTimestamp(
  mysqlDateTime: string | Date | null | undefined,
  now = new Date(),
  locale: Locale = defaultLocale,
) {
  const normalizedTimestamp = normalizeMysqlTimestamp(mysqlDateTime);
  const messages = getMessages(locale);

  if (!normalizedTimestamp || normalizedTimestamp === "0000-00-00 00:00:00") {
    return messages.common.noValue;
  }

  const timestamp = parseMysqlDateTime(normalizedTimestamp);

  if (!timestamp) {
    return messages.common.noValue;
  }

  const diffMs = now.getTime() - timestamp.getTime();
  const absoluteDiffMs = Math.abs(diffMs);
  const direction = diffMs < 0 ? 1 : -1;
  const earlier = diffMs < 0 ? now : timestamp;
  const later = diffMs < 0 ? timestamp : now;
  const relativeTimeFormatter = new Intl.RelativeTimeFormat(getIntlLocale(locale), {
    numeric: "always",
  });

  if (absoluteDiffMs <= 5 * 60 * 1000) {
    return messages.time.online;
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

export function getCalendarTimestampLabel(
  mysqlDateTime: string,
  now = new Date(),
  locale: Locale = defaultLocale,
) {
  const datePart = mysqlDateTime.slice(0, 10);
  const today = getDateKey(now);
  const yesterday = new Date(now);
  const messages = getMessages(locale);
  yesterday.setDate(now.getDate() - 1);

  if (datePart === today) {
    return `${messages.time.today} · ${getTimeLabel(mysqlDateTime)}`;
  }

  if (datePart === getDateKey(yesterday)) {
    return `${messages.time.yesterday} · ${getTimeLabel(mysqlDateTime)}`;
  }

  return `${datePart} · ${getTimeLabel(mysqlDateTime)}`;
}
