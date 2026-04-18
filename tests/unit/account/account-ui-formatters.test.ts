import { describe, expect, it } from "vitest";

import {
  formatAccountEventTimestamp,
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

  it("shortens long session identifiers for compact cards", () => {
    expect(
      formatSessionIdentifier("480bd269-da16-4a0f-bee7-b7b8ece63b312"),
    ).toBe("480bd269…b312");
  });
});
