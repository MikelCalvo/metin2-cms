import { describe, expect, it } from "vitest";

import { findPreviousSuccessfulSignIn } from "@/server/account/account-session-insights";

describe("account session insights", () => {
  it("returns the latest previous public sign-in before the current session started", () => {
    const previousSignIn = findPreviousSuccessfulSignIn(
      [
        {
          id: 1,
          eventType: "login",
          outcome: "authenticated",
          occurredAt: "2026-04-18 12:00:00",
          success: true,
          ip: "127.0.0.1",
          userAgent: "Chrome",
          deliveryMode: null,
          title: "Successful sign-in",
          description: "Current session.",
        },
        {
          id: 2,
          eventType: "login",
          outcome: "authenticated",
          occurredAt: "2026-04-18 11:30:00",
          success: true,
          ip: "192.168.1.20",
          userAgent: "Chrome",
          deliveryMode: null,
          title: "Successful sign-in",
          description: "Previous local session.",
        },
        {
          id: 3,
          eventType: "account.profile_update",
          outcome: "profile_updated",
          occurredAt: "2026-04-18 11:00:00",
          success: true,
          ip: "127.0.0.1",
          userAgent: "Chrome",
          deliveryMode: null,
          title: "Profile updated",
          description: "Email changed.",
        },
        {
          id: 4,
          eventType: "login",
          outcome: "authenticated",
          occurredAt: "2026-04-17 22:00:00",
          success: true,
          ip: "79.117.198.137",
          userAgent: "Firefox",
          deliveryMode: null,
          title: "Successful sign-in",
          description: "Previous public session.",
        },
      ],
      "2026-04-18 12:00:00",
    );

    expect(previousSignIn?.id).toBe(4);
    expect(previousSignIn?.ip).toBe("79.117.198.137");
  });

  it("falls back to the next previous public sign-in when the current session timestamp is unavailable", () => {
    const previousSignIn = findPreviousSuccessfulSignIn([
      {
        id: 1,
        eventType: "login",
        outcome: "authenticated",
        occurredAt: "2026-04-18 12:00:00",
        success: true,
        ip: "127.0.0.1",
        userAgent: "Chrome",
        deliveryMode: null,
        title: "Successful sign-in",
        description: "Most recent.",
      },
      {
        id: 2,
        eventType: "login",
        outcome: "authenticated",
        occurredAt: "2026-04-17 23:00:00",
        success: true,
        ip: "10.0.0.2",
        userAgent: "Firefox",
        deliveryMode: null,
        title: "Successful sign-in",
        description: "Older local session.",
      },
      {
        id: 3,
        eventType: "login",
        outcome: "authenticated",
        occurredAt: "2026-04-17 22:00:00",
        success: true,
        ip: "79.117.198.137",
        userAgent: "Firefox",
        deliveryMode: null,
        title: "Successful sign-in",
        description: "Older public session.",
      },
    ]);

    expect(previousSignIn?.id).toBe(3);
  });

  it("returns null when there is no earlier public sign-in to show", () => {
    const previousSignIn = findPreviousSuccessfulSignIn([
      {
        id: 1,
        eventType: "login",
        outcome: "authenticated",
        occurredAt: "2026-04-18 12:00:00",
        success: true,
        ip: "127.0.0.1",
        userAgent: "Chrome",
        deliveryMode: null,
        title: "Successful sign-in",
        description: "Most recent.",
      },
      {
        id: 2,
        eventType: "login",
        outcome: "authenticated",
        occurredAt: "2026-04-17 22:00:00",
        success: true,
        ip: "192.168.1.20",
        userAgent: "Firefox",
        deliveryMode: null,
        title: "Successful sign-in",
        description: "Older local session.",
      },
    ]);

    expect(previousSignIn).toBeNull();
  });
});
