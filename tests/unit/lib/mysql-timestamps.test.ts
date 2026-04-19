import { describe, expect, it } from "vitest";

import {
  formatRelativeMysqlTimestamp,
  getCalendarTimestampLabel,
  parseMysqlDateTime,
} from "@/lib/time/mysql-timestamps";

describe("mysql timestamp utilities", () => {
  it("parses valid mysql datetimes and rejects invalid ones", () => {
    expect(parseMysqlDateTime("2026-04-18 10:00:00")).toEqual(
      new Date(2026, 3, 18, 10, 0, 0),
    );
    expect(parseMysqlDateTime("2026-02-31 10:00:00")).toBeNull();
    expect(parseMysqlDateTime("bad-value")).toBeNull();
  });

  it("formats relative mysql timestamps with the shared public semantics", () => {
    const now = new Date(2026, 3, 18, 12, 0, 0);

    expect(formatRelativeMysqlTimestamp("2026-04-18 10:00:00", now)).toBe(
      "2 hours ago",
    );
    expect(formatRelativeMysqlTimestamp("2026-04-18 11:57:00", now)).toBe(
      "Online",
    );
    expect(formatRelativeMysqlTimestamp("2026-04-18 14:00:00", now)).toBe(
      "in 2 hours",
    );
    expect(formatRelativeMysqlTimestamp("0000-00-00 00:00:00", now)).toBe("—");
  });

  it("formats mysql timestamps into today, yesterday or date labels", () => {
    const now = new Date(2026, 3, 18, 2, 0, 0);

    expect(getCalendarTimestampLabel("2026-04-18 01:19:29", now)).toBe(
      "Today · 01:19",
    );
    expect(getCalendarTimestampLabel("2026-04-17 23:27:43", now)).toBe(
      "Yesterday · 23:27",
    );
    expect(getCalendarTimestampLabel("2026-04-10 08:30:00", now)).toBe(
      "2026-04-10 · 08:30",
    );
  });
});
