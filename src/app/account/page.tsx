import Link from "next/link";
import {
  CoinsIcon,
  DownloadIcon,
  LogOutIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  ShieldIcon,
  SparklesIcon,
  TrophyIcon,
  WalletIcon,
} from "lucide-react";
import { redirect } from "next/navigation";

import { closeOtherSessionsAction } from "@/app/account/actions";
import { logoutAction } from "@/app/auth/actions";
import { ActivityRow } from "@/components/account/activity-row";
import { ChangePasswordForm } from "@/components/account/change-password-form";
import { DashboardSection } from "@/components/account/dashboard-section";
import { ProfileSettingsForm } from "@/components/account/profile-settings-form";
import { SessionCard } from "@/components/account/session-card";
import { StatusChip } from "@/components/account/status-chip";
import { SummaryCard } from "@/components/account/summary-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatAccountLastPlayTimestamp } from "@/lib/account-ui-formatters";
import { buildAccountSecuritySummary } from "@/server/account/account-security-summary";
import { listRecentAuthActivityForAccount } from "@/server/auth/auth-audit-service";
import { getCurrentAuthenticatedAccount } from "@/server/auth/current-account";
import { listAuthenticatedSessionsForAccount } from "@/server/session/session-service";

const ACTIVITY_PAGE_SIZE = 3;

const summaryIcons = {
  "active-sessions": <ShieldIcon className="size-4" />,
  "last-successful-sign-in": <ShieldCheckIcon className="size-4" />,
  "latest-sign-in-issue": <ShieldAlertIcon className="size-4" />,
  "latest-account-change": <SparklesIcon className="size-4" />,
} as const;

type AccountPageSearchParams = Record<string, string | string[] | undefined>;

type AccountPageProps = {
  searchParams?: Promise<AccountPageSearchParams>;
};

function getSingleSearchParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function normalizeActivityPage(value: string | undefined) {
  const parsed = Number.parseInt(value ?? "", 10);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }

  return parsed;
}

function buildActivityPageHref(
  searchParams: AccountPageSearchParams,
  activityPage: number,
) {
  const nextSearchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (key === "activityPage" || typeof value === "undefined") {
      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        nextSearchParams.append(key, item);
      }

      continue;
    }

    nextSearchParams.set(key, value);
  }

  if (activityPage > 1) {
    nextSearchParams.set("activityPage", String(activityPage));
  }

  const query = nextSearchParams.toString();

  return query ? `/account?${query}` : "/account";
}

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const authenticated = await getCurrentAuthenticatedAccount();

  if (!authenticated) {
    redirect("/login");
  }

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const activityPage = normalizeActivityPage(
    getSingleSearchParam(resolvedSearchParams.activityPage),
  );
  const activityOffset = (activityPage - 1) * ACTIVITY_PAGE_SIZE;
  const { account, session } = authenticated;
  const activeSessions = await listAuthenticatedSessionsForAccount(account.id);
  const recentAuthActivity = await listRecentAuthActivityForAccount(account.id);
  const paginatedAuthActivity = await listRecentAuthActivityForAccount(
    account.id,
    ACTIVITY_PAGE_SIZE + 1,
    activityOffset,
  );
  const hasNextActivityPage = paginatedAuthActivity.length > ACTIVITY_PAGE_SIZE;
  const visibleAuthActivity = paginatedAuthActivity.slice(0, ACTIVITY_PAGE_SIZE);
  const hasPreviousActivityPage = activityPage > 1;
  const formattedLastPlay = formatAccountLastPlayTimestamp(account.lastPlay);
  const securitySummary = buildAccountSecuritySummary({
    currentSessionId: session.id,
    activeSessions,
    recentAuthActivity,
  });
  const currentActiveSession =
    activeSessions.find((activeSession) => activeSession.id === session.id) ?? activeSessions[0] ?? null;
  const otherActiveSessions = activeSessions.filter(
    (activeSession) => activeSession.id !== session.id,
  );

  return (
    <main className="min-h-screen bg-[#09090b] text-zinc-100">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-6 py-10 sm:py-12 lg:px-8">
        <section className="overflow-hidden rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(139,92,246,0.18),_transparent_35%),linear-gradient(180deg,_rgba(255,255,255,0.08),_rgba(255,255,255,0.03))] shadow-2xl shadow-black/30">
          <div className="px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
            <div className="max-w-3xl space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-xs font-medium uppercase tracking-[0.24em] text-zinc-500">
                  Account
                </p>
                <StatusChip tone={account.status === "OK" ? "success" : "attention"}>
                  {account.status}
                </StatusChip>
              </div>
              <div className="space-y-3">
                <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  {account.login}
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-zinc-300 sm:text-base">
                  Profile, security and access. Nothing else.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-zinc-400">
                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                  Email: {account.email || "Not configured"}
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                  {activeSessions.length} active session{activeSessions.length === 1 ? "" : "s"}
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                  Last play: {formattedLastPlay}
                </div>
              </div>
              <div data-slot="account-primary-actions" className="flex flex-wrap gap-3">
                <Button
                  asChild
                  size="lg"
                  className="h-11 justify-between bg-violet-500 px-5 text-white hover:bg-violet-400"
                >
                  <Link href="/downloads">
                    Downloads
                    <DownloadIcon className="size-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-11 justify-between border-white/10 bg-white/5 px-5 text-zinc-100 hover:bg-white/10"
                >
                  <Link href="/rankings">
                    Rankings
                    <TrophyIcon className="size-4" />
                  </Link>
                </Button>
                <form action={logoutAction}>
                  <Button
                    type="submit"
                    size="lg"
                    variant="outline"
                    className="h-11 justify-between border-white/10 bg-white/5 px-5 text-zinc-100 hover:bg-white/10"
                  >
                    Sign out
                    <LogOutIcon className="size-4" />
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </section>

        <DashboardSection
          badge="Overview"
          title="Security summary"
          contentClassName="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
        >
          {securitySummary.map((item) => (
            <SummaryCard
              key={item.id}
              label={item.label}
              value={item.value}
              helper={item.helper}
              tone={item.tone}
              icon={summaryIcons[item.id]}
            />
          ))}
        </DashboardSection>

        <DashboardSection
          badge="Account"
          title="Account details"
          contentClassName="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]"
        >
          <ProfileSettingsForm
            login={account.login}
            status={account.status}
            email={account.email}
            socialId={account.socialId}
          />

          <Card className="border-white/10 bg-white/[0.04] shadow-2xl shadow-black/20 backdrop-blur-xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl text-white">Game account</CardTitle>
              <CardDescription className="text-sm leading-6 text-zinc-400">
                Read only.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-black/20 px-4 py-4">
                <div className="flex items-center gap-2 text-zinc-400">
                  <WalletIcon className="size-4" />
                  <p className="text-[0.72rem] uppercase tracking-[0.14em]">Cash</p>
                </div>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-white">{account.cash}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-black/20 px-4 py-4">
                <div className="flex items-center gap-2 text-zinc-400">
                  <CoinsIcon className="size-4" />
                  <p className="text-[0.72rem] uppercase tracking-[0.14em]">Mileage</p>
                </div>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-white">{account.mileage}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-black/20 px-4 py-4">
                <div className="flex items-center gap-2 text-zinc-400">
                  <ShieldCheckIcon className="size-4" />
                  <p className="text-[0.72rem] uppercase tracking-[0.14em]">Status</p>
                </div>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-white">{account.status}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-black/20 px-4 py-4">
                <div className="flex items-center gap-2 text-zinc-400">
                  <SparklesIcon className="size-4" />
                  <p className="text-[0.72rem] uppercase tracking-[0.14em]">Last play</p>
                </div>
                <p className="mt-2 text-base font-semibold tracking-tight text-white">
                  {formattedLastPlay}
                </p>
              </div>
            </CardContent>
          </Card>
        </DashboardSection>

        <DashboardSection
          badge="Security"
          title="Security"
          contentClassName="grid gap-4 xl:grid-cols-[minmax(320px,0.85fr)_minmax(0,1.15fr)]"
        >
          <ChangePasswordForm />

          <Card className="border-white/10 bg-white/[0.04] shadow-2xl shadow-black/20 backdrop-blur-xl">
            <CardHeader className="space-y-2">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl text-white">Sessions</CardTitle>
                  <CardDescription className="text-sm leading-6 text-zinc-400">
                    Current first. Close the rest if needed.
                  </CardDescription>
                </div>
                {otherActiveSessions.length > 0 ? (
                  <form action={closeOtherSessionsAction}>
                    <Button
                      type="submit"
                      variant="outline"
                      className="border-white/10 bg-white/5 text-zinc-100 hover:bg-white/10"
                    >
                      Close other sessions
                    </Button>
                  </form>
                ) : null}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentActiveSession ? <SessionCard session={currentActiveSession} isCurrent /> : null}

              {otherActiveSessions.length > 0 ? (
                <div className="space-y-3">
                  {otherActiveSessions.map((activeSession) => (
                    <SessionCard key={activeSession.id} session={activeSession} isCurrent={false} />
                  ))}
                </div>
              ) : (
                <Alert className="border-white/10 bg-black/20 text-zinc-100">
                  <ShieldCheckIcon className="size-4" />
                  <AlertTitle>No other active sessions</AlertTitle>
                  <AlertDescription className="text-zinc-400">
                    This account is only signed in from the current device right now.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </DashboardSection>

        <DashboardSection
          badge="Activity"
          title="Recent activity"
          contentClassName="space-y-3"
        >
          {visibleAuthActivity.length > 0 ? (
            visibleAuthActivity.map((entry) => <ActivityRow key={entry.id} entry={entry} />)
          ) : (
            <Alert className="border-white/10 bg-white/[0.04] text-zinc-100">
              <SparklesIcon className="size-4" />
              <AlertTitle>No recent activity yet</AlertTitle>
              <AlertDescription className="text-zinc-400">
                Sign-in, recovery and account-setting events will start appearing here as soon as they are recorded.
              </AlertDescription>
            </Alert>
          )}

          {hasPreviousActivityPage || hasNextActivityPage ? (
            <div className="flex flex-wrap gap-3 pt-2">
              {hasPreviousActivityPage ? (
                <Button
                  asChild
                  variant="outline"
                  className="border-white/10 bg-white/5 text-zinc-100 hover:bg-white/10"
                >
                  <Link href={buildActivityPageHref(resolvedSearchParams, activityPage - 1)}>
                    Newer activity
                  </Link>
                </Button>
              ) : null}

              {hasNextActivityPage ? (
                <Button
                  asChild
                  variant="outline"
                  className="border-white/10 bg-white/5 text-zinc-100 hover:bg-white/10"
                >
                  <Link href={buildActivityPageHref(resolvedSearchParams, activityPage + 1)}>
                    Older activity
                  </Link>
                </Button>
              ) : null}
            </div>
          ) : null}
        </DashboardSection>
      </div>
    </main>
  );
}
