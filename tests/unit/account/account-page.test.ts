import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getCurrentAuthenticatedAccountMock,
  listAuthenticatedSessionsForAccountMock,
  listRecentAuthActivityForAccountMock,
  buildAccountSecuritySummaryMock,
  formatAccountLastPlayTimestampMock,
  redirectMock,
} = vi.hoisted(() => ({
  getCurrentAuthenticatedAccountMock: vi.fn(),
  listAuthenticatedSessionsForAccountMock: vi.fn(),
  listRecentAuthActivityForAccountMock: vi.fn(),
  buildAccountSecuritySummaryMock: vi.fn(),
  formatAccountLastPlayTimestampMock: vi.fn(),
  redirectMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("@/server/auth/current-account", () => ({
  getCurrentAuthenticatedAccount: getCurrentAuthenticatedAccountMock,
}));

vi.mock("@/server/session/session-service", () => ({
  listAuthenticatedSessionsForAccount: listAuthenticatedSessionsForAccountMock,
}));

vi.mock("@/server/auth/auth-audit-service", () => ({
  listRecentAuthActivityForAccount: listRecentAuthActivityForAccountMock,
}));

vi.mock("@/server/account/account-security-summary", () => ({
  buildAccountSecuritySummary: buildAccountSecuritySummaryMock,
}));

vi.mock("@/lib/account-ui-formatters", () => ({
  formatAccountLastPlayTimestamp: formatAccountLastPlayTimestampMock,
}));

vi.mock("@/app/account/actions", () => ({
  closeOtherSessionsAction: vi.fn(),
}));

vi.mock("@/app/auth/actions", () => ({
  logoutAction: vi.fn(),
}));

vi.mock("@/components/account/profile-settings-form", () => ({
  ProfileSettingsForm: () => createElement("div", null, "profile-settings-form"),
}));

vi.mock("@/components/account/change-password-form", () => ({
  ChangePasswordForm: () => createElement("div", null, "change-password-form"),
}));

vi.mock("@/components/account/session-card", () => ({
  SessionCard: ({ isCurrent }: { isCurrent: boolean }) =>
    createElement("div", null, isCurrent ? "current-session-card" : "session-card"),
}));

vi.mock("@/components/account/activity-row", () => ({
  ActivityRow: ({ entry }: { entry: { title: string } }) =>
    createElement("div", null, `activity-row:${entry.title}`),
}));

import AccountPage from "@/app/account/page";

describe("account page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    formatAccountLastPlayTimestampMock.mockReturnValue("2 hours ago");
  });

  it("renders the simplified account layout with human-friendly last play and activity pagination", async () => {
    getCurrentAuthenticatedAccountMock.mockResolvedValue({
      account: {
        id: 7,
        login: "mk",
        status: "OK",
        email: "mk@example.test",
        socialId: "1234567",
        cash: 1200,
        mileage: 340,
        lastPlay: "2026-04-19 01:30:43",
      },
      session: {
        id: "current-session",
      },
    });

    listAuthenticatedSessionsForAccountMock.mockResolvedValue([
      {
        id: "current-session",
        createdAt: "2026-04-18 12:00:00",
        lastSeenAt: "2026-04-18 12:10:00",
        ip: "127.0.0.1",
        userAgent: "Chrome",
      },
      {
        id: "other-session",
        createdAt: "2026-04-18 11:00:00",
        lastSeenAt: "2026-04-18 11:30:00",
        ip: "10.0.0.2",
        userAgent: "Firefox",
      },
    ]);

    listRecentAuthActivityForAccountMock
      .mockResolvedValueOnce([
        {
          id: 1,
          eventType: "login",
          success: true,
          title: "Successful sign-in",
          description: "Signed in from the launcher.",
          occurredAt: "2026-04-18 12:00:00",
          ip: "127.0.0.1",
          userAgent: "Chrome",
          outcome: "Accepted",
          deliveryMode: null,
        },
      ])
      .mockResolvedValueOnce([
        {
          id: 11,
          eventType: "login",
          success: true,
          title: "Successful sign-in",
          description: "Signed in from the launcher.",
          occurredAt: "2026-04-18 12:00:00",
          ip: "127.0.0.1",
          userAgent: "Chrome",
          outcome: "Accepted",
          deliveryMode: null,
        },
        {
          id: 12,
          eventType: "account.profile_update",
          success: true,
          title: "Profile updated",
          description: "Email changed.",
          occurredAt: "2026-04-18 11:00:00",
          ip: "127.0.0.1",
          userAgent: "Chrome",
          outcome: "profile_updated",
          deliveryMode: null,
        },
        {
          id: 13,
          eventType: "account.password_change",
          success: true,
          title: "Password changed",
          description: "Password rotated.",
          occurredAt: "2026-04-18 10:00:00",
          ip: "127.0.0.1",
          userAgent: "Chrome",
          outcome: "password_updated",
          deliveryMode: null,
        },
        {
          id: 14,
          eventType: "login",
          success: false,
          title: "Failed sign-in",
          description: "Wrong password.",
          occurredAt: "2026-04-18 09:00:00",
          ip: "127.0.0.1",
          userAgent: "Chrome",
          outcome: "invalid_credentials",
          deliveryMode: null,
        },
        {
          id: 15,
          eventType: "password_recovery.request",
          success: true,
          title: "Recovery requested",
          description: "Reset link created.",
          occurredAt: "2026-04-18 08:00:00",
          ip: "127.0.0.1",
          userAgent: "Chrome",
          outcome: "token_created",
          deliveryMode: "file",
        },
        {
          id: 16,
          eventType: "custom.event",
          success: false,
          title: "Authentication event",
          description: "Older entry.",
          occurredAt: "2026-04-18 07:00:00",
          ip: "127.0.0.1",
          userAgent: "Chrome",
          outcome: "unexpected_case",
          deliveryMode: null,
        },
      ]);

    buildAccountSecuritySummaryMock.mockReturnValue([
      { id: "active-sessions", label: "Active sessions", value: "2", helper: "Launcher + browser", tone: "neutral" },
      { id: "last-successful-sign-in", label: "Last successful sign-in", value: "Today · 12:00", helper: "Launcher", tone: "success" },
      { id: "latest-sign-in-issue", label: "Latest sign-in issue", value: "None", helper: "No issues recorded", tone: "neutral" },
      { id: "latest-account-change", label: "Latest account change", value: "Profile updated", helper: "Email was updated", tone: "neutral" },
    ]);

    const html = renderToStaticMarkup(await AccountPage({}));

    expect(html).toContain("Account details");
    expect(html).toContain("Game account");
    expect(html).toContain("Security");
    expect(html).toContain("Recent activity");
    expect(html).toContain("Downloads");
    expect(html).toContain("Rankings");
    expect(html).toContain("Sign out");
    expect(html).toContain("Last play: 2 hours ago");
    expect(html).toContain("activity-row:Successful sign-in");
    expect(html).toContain("activity-row:Profile updated");
    expect(html).toContain("activity-row:Password changed");
    expect(html).not.toContain("activity-row:Failed sign-in");
    expect(html).not.toContain("activity-row:Recovery requested");
    expect(html).not.toContain("activity-row:Authentication event");
    expect(html).toContain('href="/account?activityPage=2"');
    expect(html).not.toContain("Quick access");
    expect(html).not.toContain("Open recovery");
    expect(html).not.toContain("Launcher-ready access");
    expect(html).not.toContain("Security posture");
    expect(html).not.toContain("What gets logged");
    expect(formatAccountLastPlayTimestampMock).toHaveBeenCalledWith("2026-04-19 01:30:43");
    expect(listRecentAuthActivityForAccountMock).toHaveBeenNthCalledWith(1, 7);
    expect(listRecentAuthActivityForAccountMock).toHaveBeenNthCalledWith(2, 7, 4, 0);
  });

  it("renders previous activity navigation when the user is on a later page", async () => {
    getCurrentAuthenticatedAccountMock.mockResolvedValue({
      account: {
        id: 7,
        login: "mk",
        status: "OK",
        email: "mk@example.test",
        socialId: "1234567",
        cash: 1200,
        mileage: 340,
        lastPlay: "2026-04-19 01:30:43",
      },
      session: {
        id: "current-session",
      },
    });

    listAuthenticatedSessionsForAccountMock.mockResolvedValue([
      {
        id: "current-session",
        createdAt: "2026-04-18 12:00:00",
        lastSeenAt: "2026-04-18 12:10:00",
        ip: "127.0.0.1",
        userAgent: "Chrome",
      },
    ]);

    listRecentAuthActivityForAccountMock
      .mockResolvedValueOnce([
        {
          id: 1,
          eventType: "login",
          success: true,
          title: "Successful sign-in",
          description: "Signed in from the launcher.",
          occurredAt: "2026-04-18 12:00:00",
          ip: "127.0.0.1",
          userAgent: "Chrome",
          outcome: "Accepted",
          deliveryMode: null,
        },
      ])
      .mockResolvedValueOnce([
        {
          id: 21,
          eventType: "account.password_change",
          success: true,
          title: "Password changed",
          description: "Password rotated.",
          occurredAt: "2026-04-18 06:00:00",
          ip: "127.0.0.1",
          userAgent: "Chrome",
          outcome: "password_updated",
          deliveryMode: null,
        },
      ]);

    buildAccountSecuritySummaryMock.mockReturnValue([
      { id: "active-sessions", label: "Active sessions", value: "1", helper: "Browser", tone: "neutral" },
      { id: "last-successful-sign-in", label: "Last successful sign-in", value: "Today · 12:00", helper: "Launcher", tone: "success" },
      { id: "latest-sign-in-issue", label: "Latest sign-in issue", value: "None", helper: "No issues recorded", tone: "neutral" },
      { id: "latest-account-change", label: "Latest account change", value: "Profile updated", helper: "Email was updated", tone: "neutral" },
    ]);

    const html = renderToStaticMarkup(
      await AccountPage({
        searchParams: Promise.resolve({ activityPage: "2" }),
      }),
    );

    expect(html).toContain('href="/account"');
    expect(html).not.toContain('href="/account?activityPage=3"');
    expect(html).toContain("activity-row:Password changed");
    expect(listRecentAuthActivityForAccountMock).toHaveBeenNthCalledWith(2, 7, 4, 3);
  });
});
