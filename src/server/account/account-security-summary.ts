import "server-only";

import type { AccountAuthActivityEntry } from "@/server/auth/auth-audit-service";

type SummaryTone = "neutral" | "success" | "attention";

type SummarySession = {
  id: string;
};

export type AccountSecuritySummaryItem = {
  id:
    | "active-sessions"
    | "last-successful-sign-in"
    | "latest-sign-in-issue"
    | "latest-recovery-event";
  label: string;
  value: string;
  helper: string;
  tone: SummaryTone;
};

function findLatestSuccessfulSignIn(recentAuthActivity: AccountAuthActivityEntry[]) {
  return recentAuthActivity.find(
    (entry) => entry.eventType === "login" && entry.outcome === "authenticated",
  );
}

function findLatestSignInIssue(recentAuthActivity: AccountAuthActivityEntry[]) {
  return recentAuthActivity.find(
    (entry) =>
      entry.eventType === "login" &&
      entry.outcome !== "authenticated",
  );
}

function findLatestRecoveryEvent(recentAuthActivity: AccountAuthActivityEntry[]) {
  return recentAuthActivity.find((entry) => entry.eventType.startsWith("password_recovery."));
}

function describeActiveSessions(activeSessions: SummarySession[], currentSessionId: string) {
  const otherActiveSessions = activeSessions.filter((session) => session.id !== currentSessionId).length;
  const activeLabel = activeSessions.length === 1 ? "1 active" : `${activeSessions.length} active`;

  if (otherActiveSessions === 0) {
    return {
      value: activeLabel,
      helper: "Only the current browser session is active.",
    };
  }

  const otherSessionsLabel =
    otherActiveSessions === 1 ? "1 other active session" : `${otherActiveSessions} other active sessions`;

  return {
    value: activeLabel,
    helper: `This browser plus ${otherSessionsLabel}.`,
  };
}

export function buildAccountSecuritySummary(input: {
  currentSessionId: string;
  activeSessions: SummarySession[];
  recentAuthActivity: AccountAuthActivityEntry[];
}): AccountSecuritySummaryItem[] {
  const activeSessions = describeActiveSessions(input.activeSessions, input.currentSessionId);
  const latestSuccessfulSignIn = findLatestSuccessfulSignIn(input.recentAuthActivity);
  const latestSignInIssue = findLatestSignInIssue(input.recentAuthActivity);
  const latestRecoveryEvent = findLatestRecoveryEvent(input.recentAuthActivity);

  return [
    {
      id: "active-sessions",
      label: "Active sessions",
      value: activeSessions.value,
      helper: activeSessions.helper,
      tone: "neutral",
    },
    latestSuccessfulSignIn
      ? {
          id: "last-successful-sign-in",
          label: "Last successful sign-in",
          value: latestSuccessfulSignIn.occurredAt,
          helper: latestSuccessfulSignIn.title,
          tone: "success",
        }
      : {
          id: "last-successful-sign-in",
          label: "Last successful sign-in",
          value: "No successful sign-in recorded yet",
          helper: "The account has no successful sign-in audit entries yet.",
          tone: "neutral",
        },
    latestSignInIssue
      ? {
          id: "latest-sign-in-issue",
          label: "Latest sign-in issue",
          value: latestSignInIssue.occurredAt,
          helper: latestSignInIssue.title,
          tone: "attention",
        }
      : {
          id: "latest-sign-in-issue",
          label: "Latest sign-in issue",
          value: "No sign-in issues recorded",
          helper: "No failed or blocked sign-in attempts were found in the recent audit log.",
          tone: "neutral",
        },
    latestRecoveryEvent
      ? {
          id: "latest-recovery-event",
          label: "Latest recovery event",
          value: latestRecoveryEvent.occurredAt,
          helper: latestRecoveryEvent.title,
          tone: "neutral",
        }
      : {
          id: "latest-recovery-event",
          label: "Latest recovery event",
          value: "No recovery activity recorded",
          helper: "No password recovery or reset events were found in the recent audit log.",
          tone: "neutral",
        },
  ];
}
