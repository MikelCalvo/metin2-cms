import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getCurrentAuthenticatedAccountMock,
  listAuthenticatedSessionsForAccountMock,
  listRecentAuthActivityForAccountMock,
  buildAccountSecuritySummaryMock,
  redirectMock,
} = vi.hoisted(() => ({
  getCurrentAuthenticatedAccountMock: vi.fn(),
  listAuthenticatedSessionsForAccountMock: vi.fn(),
  listRecentAuthActivityForAccountMock: vi.fn(),
  buildAccountSecuritySummaryMock: vi.fn(),
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
  ActivityRow: () => createElement("div", null, "activity-row"),
}));

import AccountPage from "@/app/account/page";

describe("account page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders a simplified authenticated account layout without filler support cards", async () => {
    getCurrentAuthenticatedAccountMock.mockResolvedValue({
      account: {
        id: 7,
        login: "mk",
        status: "OK",
        email: "mk@example.test",
        socialId: "1234567",
        cash: 1200,
        mileage: 340,
        lastPlay: "Today · 14:30",
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

    listRecentAuthActivityForAccountMock.mockResolvedValue([
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
    ]);

    buildAccountSecuritySummaryMock.mockReturnValue([
      { id: "active-sessions", label: "Active sessions", value: "2", helper: "Launcher + browser", tone: "neutral" },
      { id: "last-successful-sign-in", label: "Last successful sign-in", value: "Today · 12:00", helper: "Launcher", tone: "success" },
      { id: "latest-sign-in-issue", label: "Latest sign-in issue", value: "None", helper: "No issues recorded", tone: "neutral" },
      { id: "latest-account-change", label: "Latest account change", value: "Profile updated", helper: "Email was updated", tone: "neutral" },
    ]);

    const html = renderToStaticMarkup(await AccountPage());

    expect(html).toContain("Account details");
    expect(html).toContain("Game account");
    expect(html).toContain("Security");
    expect(html).toContain("Recent activity");
    expect(html).toContain("Downloads");
    expect(html).toContain("Rankings");
    expect(html).toContain("Sign out");
    expect(html).not.toContain("Quick access");
    expect(html).not.toContain("Open recovery");
    expect(html).not.toContain("Launcher-ready access");
    expect(html).not.toContain("Security posture");
    expect(html).not.toContain("What gets logged");
  });
});
