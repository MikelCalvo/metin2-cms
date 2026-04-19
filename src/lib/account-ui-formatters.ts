import { defaultLocale, type Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import {
  formatRelativeMysqlTimestamp,
  getCalendarTimestampLabel,
} from "@/lib/time/mysql-timestamps";

function detectBrowser(userAgent: string, locale: Locale) {
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

  return getMessages(locale).device.unknownBrowser;
}

function detectPlatform(userAgent: string, locale: Locale) {
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

  return getMessages(locale).device.unknownPlatform;
}

export function summarizeUserAgent(
  userAgent: string | null | undefined,
  locale: Locale = defaultLocale,
) {
  if (!userAgent) {
    return getMessages(locale).device.unknownDevice;
  }

  return `${detectBrowser(userAgent, locale)} · ${detectPlatform(userAgent, locale)}`;
}

export function formatAccountEventTimestamp(
  mysqlDateTime: string,
  now = new Date(),
  locale: Locale = defaultLocale,
) {
  return getCalendarTimestampLabel(mysqlDateTime, now, locale);
}

export function formatAccountLastPlayTimestamp(
  mysqlDateTime: string | null | undefined,
  now = new Date(),
  locale: Locale = defaultLocale,
) {
  return formatRelativeMysqlTimestamp(mysqlDateTime, now, locale);
}

export function formatSessionIdentifier(sessionId: string) {
  if (sessionId.length <= 16) {
    return sessionId;
  }

  return `${sessionId.slice(0, 8)}…${sessionId.slice(-4)}`;
}
