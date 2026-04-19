import { beforeEach, describe, expect, it, vi } from "vitest";

const { listRecentAuthAuditEntriesForAccountMock } = vi.hoisted(() => ({
  listRecentAuthAuditEntriesForAccountMock: vi.fn(),
}));

vi.mock("@/server/auth/auth-audit-repository", () => ({
  listRecentAuthAuditEntriesForAccount: listRecentAuthAuditEntriesForAccountMock,
}));

import { listRecentAuthActivityForAccount } from "@/server/auth/auth-audit-service";

describe("auth audit service", () => {
  beforeEach(() => {
    listRecentAuthAuditEntriesForAccountMock.mockReset();
  });

  it("maps recent auth audit rows into account activity items", async () => {
    listRecentAuthAuditEntriesForAccountMock.mockResolvedValueOnce([
      {
        id: 5,
        eventType: "account.password_change",
        login: "tester01",
        accountId: 7,
        ip: "127.0.0.1",
        userAgent: "Chrome",
        success: 1,
        detail: "outcome=password_updated",
        createdAt: "2026-04-17 14:15:00",
      },
      {
        id: 4,
        eventType: "password_recovery.reset",
        login: "tester01",
        accountId: 7,
        ip: null,
        userAgent: null,
        success: 1,
        detail: "outcome=password_updated",
        createdAt: "2026-04-17 14:10:00",
      },
      {
        id: 3,
        eventType: "password_recovery.request",
        login: "tester01",
        accountId: 7,
        ip: "127.0.0.1",
        userAgent: "Safari",
        success: 1,
        detail: "outcome=token_created;delivery=file",
        createdAt: "2026-04-17 14:05:00",
      },
      {
        id: 2,
        eventType: "login",
        login: "tester01",
        accountId: 7,
        ip: "127.0.0.1",
        userAgent: "Firefox",
        success: 0,
        detail: "outcome=invalid_credentials",
        createdAt: "2026-04-17 14:01:00",
      },
      {
        id: 1,
        eventType: "login",
        login: "tester01",
        accountId: 7,
        ip: "127.0.0.1",
        userAgent: "Chrome",
        success: 1,
        detail: "outcome=authenticated",
        createdAt: "2026-04-17 14:00:00",
      },
    ]);

    await expect(listRecentAuthActivityForAccount(7)).resolves.toEqual([
      {
        id: 5,
        eventType: "account.password_change",
        outcome: "password_updated",
        occurredAt: "2026-04-17 14:15:00",
        success: true,
        ip: "127.0.0.1",
        userAgent: "Chrome",
        deliveryMode: null,
        title: "Password changed",
        description: "The account password was changed from the authenticated account area.",
      },
      {
        id: 4,
        eventType: "password_recovery.reset",
        outcome: "password_updated",
        occurredAt: "2026-04-17 14:10:00",
        success: true,
        ip: null,
        userAgent: null,
        deliveryMode: null,
        title: "Password updated",
        description: "The account password was changed with a recovery link.",
      },
      {
        id: 3,
        eventType: "password_recovery.request",
        outcome: "token_created",
        occurredAt: "2026-04-17 14:05:00",
        success: true,
        ip: "127.0.0.1",
        userAgent: "Safari",
        deliveryMode: "file",
        title: "Recovery requested",
        description: "A password recovery link was generated for this account.",
      },
      {
        id: 2,
        eventType: "login",
        outcome: "invalid_credentials",
        occurredAt: "2026-04-17 14:01:00",
        success: false,
        ip: "127.0.0.1",
        userAgent: "Firefox",
        deliveryMode: null,
        title: "Failed sign-in",
        description: "Someone entered an invalid password for this account.",
      },
      {
        id: 1,
        eventType: "login",
        outcome: "authenticated",
        occurredAt: "2026-04-17 14:00:00",
        success: true,
        ip: "127.0.0.1",
        userAgent: "Chrome",
        deliveryMode: null,
        title: "Successful sign-in",
        description: "The account signed in successfully.",
      },
    ]);

    expect(listRecentAuthAuditEntriesForAccountMock).toHaveBeenCalledWith(7, 10, 0);
  });

  it("clamps the limit and falls back to a generic description for unknown events", async () => {
    listRecentAuthAuditEntriesForAccountMock.mockResolvedValueOnce([
      {
        id: 100,
        eventType: "account.profile_update",
        login: "tester01",
        accountId: 7,
        ip: "127.0.0.1",
        userAgent: "Safari",
        success: 1,
        detail: "outcome=profile_updated",
        createdAt: "2026-04-17 14:25:00",
      },
      {
        id: 99,
        eventType: "custom.event",
        login: "tester01",
        accountId: 7,
        ip: null,
        userAgent: null,
        success: 0,
        detail: "outcome=unexpected_case",
        createdAt: "2026-04-17 14:20:00",
      },
    ]);

    await expect(listRecentAuthActivityForAccount(7, 50, 5)).resolves.toEqual([
      {
        id: 100,
        eventType: "account.profile_update",
        outcome: "profile_updated",
        occurredAt: "2026-04-17 14:25:00",
        success: true,
        ip: "127.0.0.1",
        userAgent: "Safari",
        deliveryMode: null,
        title: "Profile updated",
        description: "The account email or delete code was updated from the authenticated account area.",
      },
      {
        id: 99,
        eventType: "custom.event",
        outcome: "unexpected_case",
        occurredAt: "2026-04-17 14:20:00",
        success: false,
        ip: null,
        userAgent: null,
        deliveryMode: null,
        title: "Authentication event",
        description: "custom.event (unexpected_case)",
      },
    ]);

    expect(listRecentAuthAuditEntriesForAccountMock).toHaveBeenCalledWith(7, 20, 5);
  });
});
