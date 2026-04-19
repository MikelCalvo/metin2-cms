import {
  formatRelativeMysqlTimestamp,
  getCalendarTimestampLabel,
} from "@/lib/time/mysql-timestamps";

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
  return getCalendarTimestampLabel(mysqlDateTime, now);
}

export function formatAccountLastPlayTimestamp(
  mysqlDateTime: string | null | undefined,
  now = new Date(),
) {
  return formatRelativeMysqlTimestamp(mysqlDateTime, now);
}

export function formatSessionIdentifier(sessionId: string) {
  if (sessionId.length <= 16) {
    return sessionId;
  }

  return `${sessionId.slice(0, 8)}…${sessionId.slice(-4)}`;
}
