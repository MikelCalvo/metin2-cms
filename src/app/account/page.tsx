import Link from "next/link";
import {
  ArrowRightIcon,
  CoinsIcon,
  DownloadIcon,
  KeyRoundIcon,
  LogOutIcon,
  MailIcon,
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

const activityHighlights = [
  "Successful and failed sign-ins",
  "Recovery requests and password changes",
  "Profile updates such as email or delete code changes",
] as const;

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
        <section className="overflow-hidden rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(139,92,246,0.18),_transparent_35%),linear-gradient(180deg,_rgba(255,255,255,0.08),_rgba(255,255,255,0.03))] shadow-2xl shadow-black/30">
          <div className="grid gap-4 px-6 py-8 sm:px-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:px-10 lg:py-10">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-xs font-medium uppercase tracking-[0.24em] text-zinc-500">
                  Player hub
                </p>
                <StatusChip tone={account.status === "OK" ? "success" : "attention"}>
                  {account.status}
                </StatusChip>
              </div>
              <div className="space-y-3">
                <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  Welcome back, {account.login}
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-zinc-300 sm:text-base">
                  Everything important for the player profile now lives in one place: contact and
                  recovery details, launcher-ready legacy account state, signed-in devices and the
                  recent activity trail.
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
                  Last play: {account.lastPlay}
                </div>
              </div>
            </div>

            <Card className="border-white/10 bg-black/20 shadow-none">
              <CardHeader className="space-y-2">
                <CardTitle className="text-xl text-white">Quick access</CardTitle>
                <CardDescription className="text-sm leading-6 text-zinc-400">
                  Jump straight to the next player action without digging through a dense dashboard.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full justify-between bg-violet-500 text-white hover:bg-violet-400">
                  <Link href="/downloads">
                    Open downloads
                    <DownloadIcon className="size-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-between border-white/10 bg-white/5 text-zinc-100 hover:bg-white/10"
                >
                  <Link href="/rankings">
                    View rankings
                    <TrophyIcon className="size-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-between border-white/10 bg-white/5 text-zinc-100 hover:bg-white/10"
                >
                  <Link href="/getting-started">
                    First-session guide
                    <ArrowRightIcon className="size-4" />
                  </Link>
                </Button>
                <form action={logoutAction}>
                  <Button
                    type="submit"
                    variant="outline"
                    className="w-full justify-between border-white/10 bg-white/5 text-zinc-100 hover:bg-white/10"
                  >
                    Sign out
                    <LogOutIcon className="size-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>

        <DashboardSection
          badge="Overview"
          title="Player hub overview"
          description="A clean top-line read on access health, recent security signals and the latest account changes."
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
          badge="Identity"
          title="Profile and recovery"
          description="Keep the editable contact and legacy recovery details isolated from the read-only account state."
          contentClassName="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]"
        >
          <ProfileSettingsForm
            login={account.login}
            status={account.status}
            email={account.email}
            socialId={account.socialId}
          />

          <Card className="border-white/10 bg-white/[0.04] shadow-2xl shadow-black/20 backdrop-blur-xl">
            <CardHeader className="space-y-2">
              <CardTitle className="text-xl text-white">Account snapshot</CardTitle>
              <CardDescription className="text-sm leading-6 text-zinc-400">
                The player-facing settings stay separate from the legacy read model, so each area is easier to scan and update.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-zinc-300">
              <div className="rounded-3xl border border-white/10 bg-black/20 px-4 py-4">
                <div className="flex items-center gap-2 text-white">
                  <MailIcon className="size-4 text-violet-300" />
                  <span className="font-medium">Recovery email</span>
                </div>
                <p className="mt-2 text-zinc-400">Used for account recovery and player communication inside the portal.</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-black/20 px-4 py-4">
                <div className="flex items-center gap-2 text-white">
                  <KeyRoundIcon className="size-4 text-violet-300" />
                  <span className="font-medium">Legacy delete code</span>
                </div>
                <p className="mt-2 text-zinc-400">Stored in the same legacy account model and kept editable without mixing it with wallet or device data.</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-black/20 px-4 py-4">
                <div className="flex items-center gap-2 text-white">
                  <ShieldCheckIcon className="size-4 text-violet-300" />
                  <span className="font-medium">Status</span>
                </div>
                <p className="mt-2 text-zinc-400">Current account status: {account.status}. Keep this section focused on identity and recovery instead of gameplay balances.</p>
              </div>
            </CardContent>
          </Card>
        </DashboardSection>

        <DashboardSection
          badge="Legacy state"
          title="Wallet and legacy account state"
          description="Read-only values mirrored from the live account table, separated from the editable profile details so the page feels less crowded."
          contentClassName="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]"
        >
          <Card className="border-white/10 bg-white/[0.04] shadow-2xl shadow-black/20 backdrop-blur-xl">
            <CardHeader className="space-y-2">
              <CardTitle className="text-xl text-white">Legacy account snapshot</CardTitle>
              <CardDescription className="text-sm leading-6 text-zinc-400">
                Cash, mileage and last-play visibility stay grouped here instead of being squeezed beside the editable profile form.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
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
                <p className="mt-2 text-base font-semibold tracking-tight text-white">{account.lastPlay}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-black/20 shadow-none">
            <CardHeader className="space-y-2">
              <CardTitle className="text-xl text-white">Launcher-ready access</CardTitle>
              <CardDescription className="text-sm leading-6 text-zinc-400">
                This account state is the part of the player hub that connects directly to the sign-in and first-session experience.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-zinc-300">
              <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4">
                The website credentials, recovery flow and game access stay aligned around the same account.
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4">
                Players can update recovery-critical fields without having their editable form mixed into wallet and session information.
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4">
                Wallet balances and last-play timestamps stay visible as a separate read-only snapshot for easier scanning.
              </div>
            </CardContent>
          </Card>
        </DashboardSection>

        <DashboardSection
          badge="Security"
          title="Security and signed-in devices"
          description="Password rotation and session control are now separated into clearer cards so device management is easier to read."
          contentClassName="grid gap-4 xl:grid-cols-[minmax(320px,0.8fr)_minmax(0,1.2fr)]"
        >
          <div className="space-y-4">
            <ChangePasswordForm />
            <Card className="border-white/10 bg-black/20 shadow-none">
              <CardHeader className="space-y-2">
                <CardTitle className="text-xl text-white">Security posture</CardTitle>
                <CardDescription className="text-sm leading-6 text-zinc-400">
                  Small reminders that keep the account safe without burying the page in one oversized section.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-6 text-zinc-300">
                <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4">
                  Changing the password revokes the other active CMS sessions after a successful update.
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4">
                  Keep the recovery email current so password resets and contact flows stay reliable.
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4">
                  Review the session list below if you sign in from the launcher, multiple browsers or shared machines.
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-white/10 bg-white/[0.04] shadow-2xl shadow-black/20 backdrop-blur-xl">
            <CardHeader className="space-y-2">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl text-white">Signed-in devices</CardTitle>
                  <CardDescription className="text-sm leading-6 text-zinc-400">
                    Your current device is highlighted first. Other sessions stay grouped in their own card area instead of blending into the whole page.
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
          title="Recent account activity"
          description="A cleaner history view for sign-ins, recovery actions and account changes."
          contentClassName="grid gap-4 xl:grid-cols-[minmax(280px,0.72fr)_minmax(0,1.28fr)]"
        >
          <Card className="border-white/10 bg-black/20 shadow-none">
            <CardHeader className="space-y-2">
              <CardTitle className="text-xl text-white">What gets logged</CardTitle>
              <CardDescription className="text-sm leading-6 text-zinc-400">
                The activity feed is now easier to scan because the explanation card lives beside the feed instead of above everything.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-zinc-300">
              {activityHighlights.map((highlight) => (
                <div key={highlight} className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4">
                  {highlight}
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="space-y-3">
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
          </div>
        </DashboardSection>
      </div>
    </main>
  );
}
