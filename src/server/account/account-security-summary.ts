import "server-only";

import { defaultLocale, type Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
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
    | "latest-account-change";
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
    (entry) => entry.eventType === "login" && entry.outcome !== "authenticated",
  );
}

function findLatestAccountChange(recentAuthActivity: AccountAuthActivityEntry[]) {
  return recentAuthActivity.find(
    (entry) =>
      entry.eventType.startsWith("password_recovery.") ||
      entry.eventType === "account.password_change" ||
      entry.eventType === "account.profile_update",
  );
}

function describeActiveSessions(
  activeSessions: SummarySession[],
  currentSessionId: string,
  locale: Locale,
) {
  const messages = getMessages(locale);
  const otherActiveSessions = activeSessions.filter((session) => session.id !== currentSessionId).length;
  const activeLabel =
    locale === defaultLocale
      ? activeSessions.length === 1
        ? "1 active"
        : `${activeSessions.length} active`
      : messages.account.activeSessions(activeSessions.length);

  if (otherActiveSessions === 0) {
    return {
      value: activeLabel,
      helper: messages.accountSummary.onlyCurrentSessionHelper,
    };
  }

  return {
    value: activeLabel,
    helper: messages.accountSummary.otherSessionsHelper(otherActiveSessions),
  };
}

export function buildAccountSecuritySummary(input: {
  currentSessionId: string;
  activeSessions: SummarySession[];
  recentAuthActivity: AccountAuthActivityEntry[];
  locale?: Locale;
}): AccountSecuritySummaryItem[] {
  const locale = input.locale ?? defaultLocale;
  const messages = getMessages(locale);
  const activeSessions = describeActiveSessions(
    input.activeSessions,
    input.currentSessionId,
    locale,
  );
  const latestSuccessfulSignIn = findLatestSuccessfulSignIn(input.recentAuthActivity);
  const latestSignInIssue = findLatestSignInIssue(input.recentAuthActivity);
  const latestAccountChange = findLatestAccountChange(input.recentAuthActivity);

  return [
    {
      id: "active-sessions",
      label: messages.accountSummary.activeSessionsLabel,
      value: activeSessions.value,
      helper: activeSessions.helper,
      tone: "neutral",
    },
    latestSuccessfulSignIn
      ? {
          id: "last-successful-sign-in",
          label: messages.accountSummary.lastSuccessfulSignInLabel,
          value: latestSuccessfulSignIn.occurredAt,
          helper: latestSuccessfulSignIn.title,
          tone: "success",
        }
      : {
          id: "last-successful-sign-in",
          label: messages.accountSummary.lastSuccessfulSignInLabel,
          value: messages.accountSummary.noSuccessfulSignInValue,
          helper: messages.accountSummary.noSuccessfulSignInHelper,
          tone: "neutral",
        },
    latestSignInIssue
      ? {
          id: "latest-sign-in-issue",
          label: messages.accountSummary.latestSignInIssueLabel,
          value: latestSignInIssue.occurredAt,
          helper: latestSignInIssue.title,
          tone: "attention",
        }
      : {
          id: "latest-sign-in-issue",
          label: messages.accountSummary.latestSignInIssueLabel,
          value: messages.accountSummary.noSignInIssuesValue,
          helper: messages.accountSummary.noSignInIssuesHelper,
          tone: "neutral",
        },
    latestAccountChange
      ? {
          id: "latest-account-change",
          label: messages.accountSummary.latestAccountChangeLabel,
          value: latestAccountChange.occurredAt,
          helper: latestAccountChange.title,
          tone: "neutral",
        }
      : {
          id: "latest-account-change",
          label: messages.accountSummary.latestAccountChangeLabel,
          value: messages.accountSummary.noAccountChangesValue,
          helper: messages.accountSummary.noAccountChangesHelper,
          tone: "neutral",
        },
  ];
}
