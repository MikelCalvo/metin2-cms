import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getCurrentAuthenticatedAccountMock,
  listAuthenticatedSessionsForAccountMock,
  listRecentAuthActivityForAccountMock,
  getAccountCharactersOverviewMock,
  buildAccountSecuritySummaryMock,
  formatAccountLastPlayTimestampMock,
  lookupIpGeoMock,
  redirectMock,
} = vi.hoisted(() => ({
  getCurrentAuthenticatedAccountMock: vi.fn(),
  listAuthenticatedSessionsForAccountMock: vi.fn(),
  listRecentAuthActivityForAccountMock: vi.fn(),
  getAccountCharactersOverviewMock: vi.fn(),
  buildAccountSecuritySummaryMock: vi.fn(),
  formatAccountLastPlayTimestampMock: vi.fn(),
  lookupIpGeoMock: vi.fn(),
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

vi.mock("@/server/account/account-characters-service", () => ({
  getAccountCharactersOverview: getAccountCharactersOverviewMock,
}));

vi.mock("@/server/account/account-security-summary", () => ({
  buildAccountSecuritySummary: buildAccountSecuritySummaryMock,
}));

vi.mock("@/lib/account-ui-formatters", () => ({
  formatAccountLastPlayTimestamp: formatAccountLastPlayTimestampMock,
}));

vi.mock("@/server/ip-geo/ip-geo-service", () => ({
  lookupIpGeo: lookupIpGeoMock,
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

vi.mock("@/components/account/account-character-card", () => ({
  AccountCharacterCard: ({ character }: { character: { name: string } }) =>
    createElement("div", null, `character-card:${character.name}`),
}));

vi.mock("@/components/account/session-card", () => ({
  SessionCard: ({
    session,
    isCurrent,
  }: {
    session: { id: string };
    isCurrent: boolean;
  }) => createElement("div", null, isCurrent ? `current-session-card:${session.id}` : `session-card:${session.id}`),
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
    lookupIpGeoMock.mockResolvedValue(null);
  });

  it("renders the simplified account layout with character info, session info, last non-current IP, and activity pagination", async () => {
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

    getAccountCharactersOverviewMock.mockResolvedValue({
      status: "available",
      characters: [
        {
          id: 3,
          name: "mk",
          job: 7,
          classLabel: "Shaman",
          level: 99,
          exp: 0,
          playtime: 2,
          lastPlay: "2026-04-18 05:45:44",
          guildName: null,
        },
        {
          id: 9,
          name: "WarBoss",
          job: 0,
          classLabel: "Warrior",
          level: 75,
          exp: 12345,
          playtime: 77,
          lastPlay: "2026-04-17 05:45:44",
          guildName: "[GM-TEAM]",
        },
      ],
    });

    lookupIpGeoMock.mockImplementation(async (ip: string | null | undefined) => {
      if (ip === "79.117.198.137") {
        return {
          countryCode: "ES",
          city: "Madrid",
          postalCode: "28001",
          timeZone: "Europe/Madrid",
          isp: "Telefonica",
          source: "ipapi.co",
        };
      }

      return null;
    });

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
        {
          id: 2,
          eventType: "login",
          success: true,
          title: "Successful sign-in",
          description: "Signed in from home LAN.",
          occurredAt: "2026-04-18 11:00:00",
          ip: "192.168.1.20",
          userAgent: "Firefox",
          outcome: "Accepted",
          deliveryMode: null,
        },
        {
          id: 3,
          eventType: "login",
          success: true,
          title: "Successful sign-in",
          description: "Signed in from another device.",
          occurredAt: "2026-04-17 22:00:00",
          ip: "79.117.198.137",
          userAgent: "Firefox",
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
    const downloadsActions = html.match(/>Downloads</g) ?? [];
    const rankingsActions = html.match(/>Rankings</g) ?? [];
    const openCharacterProfileActions = html.match(/Open character profile/g) ?? [];

    expect(html).toContain("Character info");
    expect(html).toContain("Session info");
    expect(html).toContain("Last IP");
    expect(html).toContain("🇪🇸 79.117.198.137");
    expect(html).not.toContain("Spain");
    expect(html).toContain("Account details");
    expect(html).toContain("Game account");
    expect(html).toContain("My characters");
    expect(html).toContain("Security");
    expect(html).toContain("Recent activity");
    expect(html).toContain("Downloads");
    expect(html).toContain("Rankings");
    expect(downloadsActions).toHaveLength(1);
    expect(rankingsActions).toHaveLength(1);
    expect(openCharacterProfileActions).toHaveLength(1);
    expect(html).toContain('href="/characters/3"');
    expect(html).toContain("Sign out");
    expect(html).toContain("Last play: 2 hours ago");
    expect(html).toContain("character-card:mk");
    expect(html).toContain("character-card:WarBoss");
    expect(html).toContain("current-session-card:current-session");
    expect(html).toContain("session-card:other-session");
    expect(html).toContain("activity-row:Successful sign-in");
    expect(html).toContain("activity-row:Profile updated");
    expect(html).toContain("activity-row:Password changed");
    expect(html).not.toContain("activity-row:Failed sign-in");
    expect(html).not.toContain("activity-row:Recovery requested");
    expect(html).not.toContain("activity-row:Authentication event");
    expect(html).toContain('href="/account?activityPage=2"');
    expect(html).not.toContain("Character spotlight");
    expect(html).not.toContain("Ready for the next login");
    expect(html).not.toContain("Quick access");
    expect(html).not.toContain("Open recovery");
    expect(html).not.toContain("Launcher-ready access");
    expect(html).not.toContain("Security posture");
    expect(html).not.toContain("What gets logged");
    expect(html).not.toContain("Characters, launcher path and account access in one place.");
    expect(html).not.toContain("Your main route back into the server starts here.");
    expect(html).not.toContain("Highest-level character tied to this account.");
    expect(html).not.toContain("Launcher, ladder and character profile are one click away.");
    expect(html).not.toContain("Live characters tied to this account.");
    expect(html).not.toContain("Current first. Close the rest if needed.");
    expect(formatAccountLastPlayTimestampMock).toHaveBeenCalledWith("2026-04-19 01:30:43");
    expect(getAccountCharactersOverviewMock).toHaveBeenCalledWith(7, expect.any(String));
    expect(lookupIpGeoMock).toHaveBeenCalledWith("79.117.198.137");
    expect(listRecentAuthActivityForAccountMock).toHaveBeenNthCalledWith(1, 7);
    expect(listRecentAuthActivityForAccountMock).toHaveBeenNthCalledWith(2, 7, 4, 0);
  });

  it("paginates other active sessions three at a time without growing the section downward", async () => {
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
        id: "session-1",
        createdAt: "2026-04-18 11:00:00",
        lastSeenAt: "2026-04-18 11:10:00",
        ip: "79.117.198.101",
        userAgent: "Firefox",
      },
      {
        id: "session-2",
        createdAt: "2026-04-18 10:00:00",
        lastSeenAt: "2026-04-18 10:10:00",
        ip: "79.117.198.102",
        userAgent: "Firefox",
      },
      {
        id: "session-3",
        createdAt: "2026-04-18 09:00:00",
        lastSeenAt: "2026-04-18 09:10:00",
        ip: "79.117.198.103",
        userAgent: "Firefox",
      },
      {
        id: "session-4",
        createdAt: "2026-04-18 08:00:00",
        lastSeenAt: "2026-04-18 08:10:00",
        ip: "79.117.198.104",
        userAgent: "Firefox",
      },
      {
        id: "session-5",
        createdAt: "2026-04-18 07:00:00",
        lastSeenAt: "2026-04-18 07:10:00",
        ip: "79.117.198.105",
        userAgent: "Firefox",
      },
    ]);

    getAccountCharactersOverviewMock.mockResolvedValue({
      status: "available",
      characters: [],
    });

    listRecentAuthActivityForAccountMock.mockResolvedValue([]);
    buildAccountSecuritySummaryMock.mockReturnValue([
      { id: "active-sessions", label: "Active sessions", value: "6", helper: "Multiple sessions", tone: "neutral" },
      { id: "last-successful-sign-in", label: "Last successful sign-in", value: "None", helper: "No activity", tone: "neutral" },
      { id: "latest-sign-in-issue", label: "Latest sign-in issue", value: "None", helper: "No activity", tone: "neutral" },
      { id: "latest-account-change", label: "Latest account change", value: "None", helper: "No activity", tone: "neutral" },
    ]);

    const firstPageHtml = renderToStaticMarkup(await AccountPage({}));

    expect(firstPageHtml).toContain("current-session-card:current-session");
    expect(firstPageHtml).toContain("session-card:session-1");
    expect(firstPageHtml).toContain("session-card:session-2");
    expect(firstPageHtml).toContain("session-card:session-3");
    expect(firstPageHtml).not.toContain("session-card:session-4");
    expect(firstPageHtml).not.toContain("session-card:session-5");
    expect(firstPageHtml).toContain('href="/account?sessionsPage=2"');

    const secondPageHtml = renderToStaticMarkup(
      await AccountPage({
        searchParams: Promise.resolve({ sessionsPage: "2" }),
      }),
    );

    expect(secondPageHtml).toContain("current-session-card:current-session");
    expect(secondPageHtml).toContain("session-card:session-4");
    expect(secondPageHtml).toContain("session-card:session-5");
    expect(secondPageHtml).not.toContain("session-card:session-1");
    expect(secondPageHtml).not.toContain('href="/account?sessionsPage=3"');
    expect(secondPageHtml).toContain('href="/account"');
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

    getAccountCharactersOverviewMock.mockResolvedValue({
      status: "available",
      characters: [],
    });

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

  it("shows a graceful unavailable state when the player character feed cannot be loaded", async () => {
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

    listAuthenticatedSessionsForAccountMock.mockResolvedValue([]);
    getAccountCharactersOverviewMock.mockResolvedValue({
      status: "unavailable",
      reason: "query_failed",
      message: "Characters are temporarily unavailable.",
    });
    listRecentAuthActivityForAccountMock.mockResolvedValueOnce([]).mockResolvedValueOnce([]);
    buildAccountSecuritySummaryMock.mockReturnValue([
      { id: "active-sessions", label: "Active sessions", value: "0", helper: "No sessions", tone: "neutral" },
      { id: "last-successful-sign-in", label: "Last successful sign-in", value: "None", helper: "No activity", tone: "neutral" },
      { id: "latest-sign-in-issue", label: "Latest sign-in issue", value: "None", helper: "No activity", tone: "neutral" },
      { id: "latest-account-change", label: "Latest account change", value: "None", helper: "No activity", tone: "neutral" },
    ]);

    const html = renderToStaticMarkup(await AccountPage({}));

    expect(html).toContain("Character feed unavailable");
    expect(html).toContain("Characters are temporarily unavailable.");
  });
});
