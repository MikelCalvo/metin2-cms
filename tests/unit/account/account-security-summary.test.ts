import { describe, expect, it } from "vitest";

import { buildAccountSecuritySummary } from "@/server/account/account-security-summary";

describe("account security summary", () => {
  it("builds summary cards from active sessions and recent auth activity", () => {
    const summary = buildAccountSecuritySummary({
      currentSessionId: "session-current",
      activeSessions: [{ id: "session-current" }, { id: "session-other" }],
      recentAuthActivity: [
        {
          id: 11,
          eventType: "account.profile_update",
          outcome: "profile_updated",
          occurredAt: "2026-04-18 10:05:00",
          success: true,
          ip: "127.0.0.1",
          userAgent: "Chrome",
          deliveryMode: null,
          title: "Profile updated",
          description: "The account email or delete code was updated from the authenticated account area.",
        },
        {
          id: 10,
          eventType: "login",
          outcome: "authenticated",
          occurredAt: "2026-04-18 10:00:00",
          success: true,
          ip: "127.0.0.1",
          userAgent: "Chrome",
          deliveryMode: null,
          title: "Successful sign-in",
          description: "The account signed in successfully.",
        },
        {
          id: 9,
          eventType: "login",
          outcome: "invalid_credentials",
          occurredAt: "2026-04-18 09:50:00",
          success: false,
          ip: "127.0.0.1",
          userAgent: "Chrome",
          deliveryMode: null,
          title: "Failed sign-in",
          description: "Someone entered an invalid password for this account.",
        },
        {
          id: 8,
          eventType: "password_recovery.request",
          outcome: "token_created",
          occurredAt: "2026-04-18 09:45:00",
          success: true,
          ip: "127.0.0.1",
          userAgent: "Chrome",
          deliveryMode: "file",
          title: "Recovery requested",
          description: "A password recovery link was generated for this account.",
        },
      ],
    });

    expect(summary).toEqual([
      {
        id: "active-sessions",
        label: "Active sessions",
        value: "2 active",
        helper: "This browser plus 1 other active session.",
        tone: "neutral",
      },
      {
        id: "last-successful-sign-in",
        label: "Last successful sign-in",
        value: "2026-04-18 10:00:00",
        helper: "Successful sign-in",
        tone: "success",
      },
      {
        id: "latest-sign-in-issue",
        label: "Latest sign-in issue",
        value: "2026-04-18 09:50:00",
        helper: "Failed sign-in",
        tone: "attention",
      },
      {
        id: "latest-account-change",
        label: "Latest account change",
        value: "2026-04-18 10:05:00",
        helper: "Profile updated",
        tone: "neutral",
      },
    ]);
  });

  it("returns sensible fallbacks when there is no recent security activity", () => {
    const summary = buildAccountSecuritySummary({
      currentSessionId: "session-current",
      activeSessions: [{ id: "session-current" }],
      recentAuthActivity: [],
    });

    expect(summary).toEqual([
      {
        id: "active-sessions",
        label: "Active sessions",
        value: "1 active",
        helper: "Only the current browser session is active.",
        tone: "neutral",
      },
      {
        id: "last-successful-sign-in",
        label: "Last successful sign-in",
        value: "No successful sign-in recorded yet",
        helper: "The account has no successful sign-in audit entries yet.",
        tone: "neutral",
      },
      {
        id: "latest-sign-in-issue",
        label: "Latest sign-in issue",
        value: "No sign-in issues recorded",
        helper: "No failed or blocked sign-in attempts were found in the recent audit log.",
        tone: "neutral",
      },
      {
        id: "latest-account-change",
        label: "Latest account change",
        value: "No account changes recorded",
        helper: "No recovery, password or profile changes were found in the recent audit log.",
        tone: "neutral",
      },
    ]);
  });
});
