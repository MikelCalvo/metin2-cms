import { describe, expect, it } from "vitest";

import {
  formatAccountEventTimestamp,
  formatAccountLastPlayTimestamp,
  formatSessionIdentifier,
  summarizeUserAgent,
} from "@/lib/account-ui-formatters";

describe("account ui formatters", () => {
  it("summarizes a desktop browser user agent into a compact label", () => {
    expect(
      summarizeUserAgent(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.704.93 Safari/537.36 OPR/114.0.5190.40",
      ),
    ).toBe("Opera 114 · macOS");
  });

  it("falls back gracefully when the user agent is missing", () => {
    expect(summarizeUserAgent(null)).toBe("Unknown device");
  });

  it("formats recent timestamps as today or yesterday labels", () => {
    const now = new Date(2026, 3, 18, 2, 0, 0);

    expect(formatAccountEventTimestamp("2026-04-18 01:19:29", now)).toBe(
      "Today · 01:19",
    );
    expect(formatAccountEventTimestamp("2026-04-17 23:27:43", now)).toBe(
      "Yesterday · 23:27",
    );
  });

  it("formats account last-play timestamps into human-friendly relative labels", () => {
    const now = new Date(2026, 3, 18, 12, 0, 0);

    expect(formatAccountLastPlayTimestamp("2026-04-18 10:00:00", now)).toBe(
      "2 hours ago",
    );
    expect(formatAccountLastPlayTimestamp("2026-04-18 11:57:00", now)).toBe(
      "Online",
    );
    expect(formatAccountLastPlayTimestamp("0000-00-00 00:00:00", now)).toBe("—");
  });

  it("shortens long session identifiers for compact cards", () => {
    expect(
      formatSessionIdentifier("480bd269-da16-4a0f-bee7-b7b8ece63b312"),
    ).toBe("480bd269…b312");
  });
});
