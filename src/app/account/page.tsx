import {
  CoinsIcon,
  LogOutIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  ShieldIcon,
  SparklesIcon,
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
import { Separator } from "@/components/ui/separator";
import { getCurrentAuthenticatedAccount } from "@/server/auth/current-account";
import { listRecentAuthActivityForAccount } from "@/server/auth/auth-audit-service";
import { buildAccountSecuritySummary } from "@/server/account/account-security-summary";
import { listAuthenticatedSessionsForAccount } from "@/server/session/session-service";

const summaryIcons = {
  "active-sessions": <ShieldIcon className="size-4" />,
  "last-successful-sign-in": <ShieldCheckIcon className="size-4" />,
  "latest-sign-in-issue": <ShieldAlertIcon className="size-4" />,
  "latest-account-change": <SparklesIcon className="size-4" />,
} as const;

export default async function AccountPage() {
  const authenticated = await getCurrentAuthenticatedAccount();

  if (!authenticated) {
    redirect("/login");
  }

  const { account, session } = authenticated;
  const activeSessions = await listAuthenticatedSessionsForAccount(account.id);
  const recentAuthActivity = await listRecentAuthActivityForAccount(account.id);
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
        <section className="overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(139,92,246,0.18),_transparent_35%),linear-gradient(180deg,_rgba(255,255,255,0.08),_rgba(255,255,255,0.03))] shadow-2xl shadow-black/30">
          <div className="flex flex-col gap-8 px-6 py-8 sm:px-8 lg:flex-row lg:items-start lg:justify-between lg:px-10 lg:py-10">
            <div className="max-w-3xl space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-xs font-medium uppercase tracking-[0.24em] text-zinc-500">
                  Account center
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
                  Manage profile details, game account state and sign-in security from one
                  place. This area is now the operational dashboard for the authenticated CMS
                  account.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-zinc-400">
                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                  Email: {account.email || "Not configured"}
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                  {activeSessions.length} active session{activeSessions.length === 1 ? "" : "s"}
                </div>
              </div>
            </div>

            <form action={logoutAction}>
              <Button
                type="submit"
                variant="outline"
                className="border-white/10 bg-white/5 text-zinc-100 hover:bg-white/10"
              >
                <LogOutIcon className="size-4" />
                Sign out
              </Button>
            </form>
          </div>
        </section>

        <DashboardSection
          badge="Overview"
          title="Account overview"
          description="A quick read on activity, access health and the latest account-level changes."
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
          badge="Profile"
          title="Profile and game account"
          description="Editable identity details on the left and live game account data on the right."
          contentClassName="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]"
        >
          <ProfileSettingsForm
            login={account.login}
            status={account.status}
            email={account.email}
            socialId={account.socialId}
          />

          <Card className="border-white/10 bg-white/[0.04] shadow-2xl shadow-black/20 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-lg text-white">Game account</CardTitle>
              <CardDescription className="text-zinc-400">
                Read-only legacy data pulled directly from the live account schema.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/8 bg-black/20 px-3 py-3">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <WalletIcon className="size-4" />
                    <p className="text-[0.72rem] uppercase tracking-[0.14em]">Cash</p>
                  </div>
                  <p className="mt-2 text-xl font-semibold tracking-tight text-white">
                    {account.cash}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/20 px-3 py-3">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <CoinsIcon className="size-4" />
                    <p className="text-[0.72rem] uppercase tracking-[0.14em]">Mileage</p>
                  </div>
                  <p className="mt-2 text-xl font-semibold tracking-tight text-white">
                    {account.mileage}
                  </p>
                </div>
              </div>

              <Separator className="bg-white/8" />

              <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-4">
                <p className="text-[0.72rem] uppercase tracking-[0.14em] text-zinc-500">
                  Last play
                </p>
                <p className="mt-2 text-base font-medium text-zinc-100">{account.lastPlay}</p>
                <p className="mt-1 text-sm text-zinc-500">
                  Latest activity timestamp recorded by the legacy game stack.
                </p>
              </div>
            </CardContent>
          </Card>
        </DashboardSection>

        <DashboardSection
          badge="Security"
          title="Security center"
          description="Session control, password rotation and the device currently authenticated in the CMS."
          action={
            otherActiveSessions.length > 0 ? (
              <form action={closeOtherSessionsAction}>
                <Button
                  type="submit"
                  variant="outline"
                  className="border-white/10 bg-white/5 text-zinc-100 hover:bg-white/10"
                >
                  Close other sessions
                </Button>
              </form>
            ) : undefined
          }
          contentClassName="grid gap-4 xl:grid-cols-[minmax(320px,0.85fr)_minmax(0,1.15fr)]"
        >
          <ChangePasswordForm />

          <div className="space-y-4">
            <div className="space-y-1 px-1">
              <h3 className="text-base font-medium text-white">Signed-in sessions</h3>
              <p className="text-sm text-zinc-400">
                Your current device is highlighted first. Other browser sessions can be revoked individually.
              </p>
            </div>

            {currentActiveSession ? <SessionCard session={currentActiveSession} isCurrent /> : null}

            {otherActiveSessions.length > 0 ? (
              <div className="space-y-3">
                {otherActiveSessions.map((activeSession) => (
                  <SessionCard key={activeSession.id} session={activeSession} isCurrent={false} />
                ))}
              </div>
            ) : (
              <Alert className="border-white/10 bg-white/[0.04] text-zinc-100">
                <ShieldCheckIcon className="size-4" />
                <AlertTitle>No other active sessions</AlertTitle>
                <AlertDescription className="text-zinc-400">
                  This account is only signed in from the current browser right now.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </DashboardSection>

        <DashboardSection
          badge="Activity"
          title="Recent account activity"
          description="Compact sign-in, recovery and settings events from the CMS audit log."
          contentClassName="space-y-3"
        >
          {recentAuthActivity.length > 0 ? (
            recentAuthActivity.map((entry) => <ActivityRow key={entry.id} entry={entry} />)
          ) : (
            <Alert className="border-white/10 bg-white/[0.04] text-zinc-100">
              <SparklesIcon className="size-4" />
              <AlertTitle>No recent activity yet</AlertTitle>
              <AlertDescription className="text-zinc-400">
                Sign-in, recovery and account-setting events will start appearing here as soon as they are recorded.
              </AlertDescription>
            </Alert>
          )}
        </DashboardSection>
      </div>
    </main>
  );
}
