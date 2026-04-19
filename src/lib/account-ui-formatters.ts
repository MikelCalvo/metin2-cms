const relativeTimeFormatter = new Intl.RelativeTimeFormat("en", { numeric: "always" });

function getDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getTimeLabel(mysqlDateTime: string) {
  return mysqlDateTime.slice(11, 16);
}

function parseMysqlDateTime(mysqlDateTime: string) {
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

function detectBrowser(userAgent: string) {
  const browserMatchers = [
    { regex: /OPR\/(\d+)/, label: "Opera" },
    { regex: /Edg\/(\d+)/, label: "Edge" },
    { regex: /Chrome\/(\d+)/, label: "Chrome" },
    { regex: /Firefox\/(\d+)/, label: "Firefox" },
    { regex: /Version\/(\d+).+Safari\//, label: "Safari" },
  ];

  for (const matcher of browserMatchers) {
    const match = userAgent.match(matcher.regex);

    if (match?.[1]) {
      return `${matcher.label} ${match[1]}`;
    }
  }

  return "Unknown browser";
}

function detectPlatform(userAgent: string) {
  if (/Mac OS X|Macintosh/.test(userAgent)) {
    return "macOS";
  }

  if (/Windows NT/.test(userAgent)) {
    return "Windows";
  }

  if (/Android/.test(userAgent)) {
    return "Android";
  }

  if (/iPhone|iPad|iPod/.test(userAgent)) {
    return "iOS";
  }

  if (/Linux/.test(userAgent)) {
    return "Linux";
  }

  return "Unknown platform";
}

export function summarizeUserAgent(userAgent: string | null | undefined) {
  if (!userAgent) {
    return "Unknown device";
  }

  return `${detectBrowser(userAgent)} · ${detectPlatform(userAgent)}`;
}

export function formatAccountEventTimestamp(
  mysqlDateTime: string,
  now = new Date(),
) {
  const datePart = mysqlDateTime.slice(0, 10);
  const today = getDateKey(now);
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (datePart === today) {
    return `Today · ${getTimeLabel(mysqlDateTime)}`;
  }

  if (datePart === getDateKey(yesterday)) {
    return `Yesterday · ${getTimeLabel(mysqlDateTime)}`;
  }

  return `${datePart} · ${getTimeLabel(mysqlDateTime)}`;
}

export function formatAccountLastPlayTimestamp(
  mysqlDateTime: string | null | undefined,
  now = new Date(),
) {
  if (!mysqlDateTime || mysqlDateTime === "0000-00-00 00:00:00") {
    return "—";
  }

  const timestamp = parseMysqlDateTime(mysqlDateTime);

  if (!timestamp) {
    return "—";
  }

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

export function formatSessionIdentifier(sessionId: string) {
  if (sessionId.length <= 16) {
    return sessionId;
  }

  return `${sessionId.slice(0, 8)}…${sessionId.slice(-4)}`;
}
