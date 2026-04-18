function getDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getTimeLabel(mysqlDateTime: string) {
  return mysqlDateTime.slice(11, 16);
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

export function formatSessionIdentifier(sessionId: string) {
  if (sessionId.length <= 16) {
    return sessionId;
  }

  return `${sessionId.slice(0, 8)}…${sessionId.slice(-4)}`;
}
