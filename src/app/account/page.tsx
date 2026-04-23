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
import { AccountCharacterCard } from "@/components/account/account-character-card";
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
import { sanitizeDisplayText, sanitizeOptionalDisplayText } from "@/lib/display-text";
import { defaultLocale } from "@/lib/i18n/config";
import { getCurrentLocale, getMessagesForRequest } from "@/lib/i18n/server";
import { formatFlaggedIp } from "@/lib/ip-geo/presentation";
import { getAccountCharactersOverview } from "@/server/account/account-characters-service";
import { findPreviousSuccessfulSignIn } from "@/server/account/account-session-insights";
import { buildAccountSecuritySummary } from "@/server/account/account-security-summary";
import { listRecentAuthActivityForAccount } from "@/server/auth/auth-audit-service";
import { getCurrentAuthenticatedAccount } from "@/server/auth/current-account";
import { lookupIpGeo } from "@/server/ip-geo/ip-geo-service";
import { formatPlaytimeDuration, formatRankingTimestamp } from "@/server/rankings/rankings-formatters";
import { listAuthenticatedSessionsForAccount } from "@/server/session/session-service";

const ACTIVITY_PAGE_SIZE = 3;
const SESSION_PAGE_SIZE = 3;

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

function normalizePage(value: string | undefined) {
  const parsed = Number.parseInt(value ?? "", 10);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }

  return parsed;
}

function clampPage(page: number, totalItems: number, pageSize: number) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  return Math.min(page, totalPages);
}

function buildAccountPageHref(
  searchParams: AccountPageSearchParams,
  pageKey: string,
  page: number,
) {
  const nextSearchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (key === pageKey || typeof value === "undefined") {
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

  if (page > 1) {
    nextSearchParams.set(pageKey, String(page));
  }

  const query = nextSearchParams.toString();

  return query ? `/account?${query}` : "/account";
}

function normalizeIpLookupKey(ip: string | null | undefined) {
  const trimmedIp = ip?.trim();
  return trimmedIp ? trimmedIp : null;
}

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const authenticated = await getCurrentAuthenticatedAccount();

  if (!authenticated) {
    redirect("/login");
  }

  const locale = await getCurrentLocale();
  const messages = await getMessagesForRequest();
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const activityPage = normalizePage(
    getSingleSearchParam(resolvedSearchParams.activityPage),
  );
  const sessionsPage = normalizePage(
    getSingleSearchParam(resolvedSearchParams.sessionsPage),
  );
  const activityOffset = (activityPage - 1) * ACTIVITY_PAGE_SIZE;
  const { account, session } = authenticated;
  const safeAccountLogin = sanitizeDisplayText(account.login ?? "");
  const safeAccountEmail = sanitizeOptionalDisplayText(account.email);
  const safeAccountStatus = sanitizeDisplayText(account.status ?? "");
  const safeAccountSocialId = sanitizeDisplayText(account.socialId ?? "");
  const activeSessions = await listAuthenticatedSessionsForAccount(account.id);
  const accountCharactersOverview = await getAccountCharactersOverview(account.id, locale);
  const recentAuthActivity =
    locale === defaultLocale
      ? await listRecentAuthActivityForAccount(account.id)
      : await listRecentAuthActivityForAccount(account.id, undefined, undefined, locale);
  const paginatedAuthActivity =
    locale === defaultLocale
      ? await listRecentAuthActivityForAccount(
          account.id,
          ACTIVITY_PAGE_SIZE + 1,
          activityOffset,
        )
      : await listRecentAuthActivityForAccount(
          account.id,
          ACTIVITY_PAGE_SIZE + 1,
          activityOffset,
          locale,
        );
  const hasNextActivityPage = paginatedAuthActivity.length > ACTIVITY_PAGE_SIZE;
  const visibleAuthActivity = paginatedAuthActivity.slice(0, ACTIVITY_PAGE_SIZE);
  const hasPreviousActivityPage = activityPage > 1;
  const formattedLastPlay =
    locale === defaultLocale
      ? formatAccountLastPlayTimestamp(account.lastPlay)
      : formatAccountLastPlayTimestamp(account.lastPlay, new Date(), locale);
  const currentActiveSession =
    activeSessions.find((activeSession) => activeSession.id === session.id) ?? activeSessions[0] ?? null;
  const otherActiveSessions = activeSessions.filter(
    (activeSession) => activeSession.id !== currentActiveSession?.id,
  );
  const visibleSessionsPage = clampPage(sessionsPage, otherActiveSessions.length, SESSION_PAGE_SIZE);
  const sessionsOffset = (visibleSessionsPage - 1) * SESSION_PAGE_SIZE;
  const visibleOtherActiveSessions = otherActiveSessions.slice(
    sessionsOffset,
    sessionsOffset + SESSION_PAGE_SIZE,
  );
  const hasPreviousSessionsPage = visibleSessionsPage > 1;
  const hasNextSessionsPage = otherActiveSessions.length > sessionsOffset + SESSION_PAGE_SIZE;
  const previousSuccessfulSignIn = findPreviousSuccessfulSignIn(
    recentAuthActivity,
    currentActiveSession?.createdAt,
  );
  const ipLookupCandidates = Array.from(
    new Set(
      [
        currentActiveSession?.ip,
        ...visibleOtherActiveSessions.map((activeSession) => activeSession.ip),
        previousSuccessfulSignIn?.ip,
        ...visibleAuthActivity.map((entry) => entry.ip),
      ]
        .map((ip) => normalizeIpLookupKey(ip))
        .filter((ip): ip is string => ip !== null),
    ),
  );
  const ipGeoEntries = await Promise.all(
    ipLookupCandidates.map(async (ip) => [ip, await lookupIpGeo(ip)] as const),
  );
  const ipGeoByIp = new Map(ipGeoEntries);
  const previousSuccessfulSignInGeo =
    ipGeoByIp.get(normalizeIpLookupKey(previousSuccessfulSignIn?.ip) ?? "") ?? null;
  const previousSuccessfulSignInLabel = formatFlaggedIp(
    previousSuccessfulSignIn?.ip,
    previousSuccessfulSignInGeo?.countryCode,
  );
  const securitySummary = buildAccountSecuritySummary({
    currentSessionId: session.id,
    activeSessions,
    recentAuthActivity,
    locale,
  }).map((item) => ({
    ...item,
    label: sanitizeDisplayText(item.label),
    value: sanitizeDisplayText(item.value),
    helper: sanitizeDisplayText(item.helper),
  }));
  const featuredCharacter =
    accountCharactersOverview.status === "available"
      ? [...accountCharactersOverview.characters].sort((left, right) => {
          if (right.level !== left.level) {
            return right.level - left.level;
          }

          return right.playtime - left.playtime;
        })[0] ?? null
      : null;
  const safeFeaturedCharacterName = featuredCharacter ? sanitizeDisplayText(featuredCharacter.name) : null;
  const safeFeaturedCharacterGuildName = featuredCharacter
    ? sanitizeOptionalDisplayText(featuredCharacter.guildName)
    : null;

  return (
    <main className="min-h-screen bg-[#09090b] text-zinc-100">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-6 sm:gap-10 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <section className="site-surface overflow-hidden rounded-[30px] shadow-2xl shadow-black/30">
          <div className="px-5 py-6 sm:px-7 sm:py-7 lg:px-8 lg:py-8">
            <div className="max-w-3xl space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-xs font-medium uppercase tracking-[0.24em] text-zinc-500">
                  {messages.account.eyebrow}
                </p>
                <StatusChip tone={account.status === "OK" ? "success" : "attention"}>
                  {safeAccountStatus}
                </StatusChip>
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  {safeAccountLogin}
                </h1>
              </div>
              <div className="flex flex-wrap gap-2 text-sm text-zinc-400">
                <div className="site-pill rounded-full px-3 py-1.5">
                  {messages.account.emailLabel}: {safeAccountEmail || messages.common.notConfigured}
                </div>
                <div className="site-pill rounded-full px-3 py-1.5">
                  {messages.account.activeSessions(activeSessions.length)}
                </div>
                {accountCharactersOverview.status === "available" ? (
                  <div className="site-pill rounded-full px-3 py-1.5">
                    {messages.account.charactersReady(accountCharactersOverview.characters.length)}
                  </div>
                ) : null}
                <div className="site-pill rounded-full px-3 py-1.5">
                  {messages.common.lastPlay}: {formattedLastPlay}
                </div>
              </div>
              <div data-slot="account-primary-actions" className="grid gap-3 sm:flex sm:flex-wrap">
                <Button
                  asChild
                  size="lg"
                  className="h-11 w-full justify-between bg-violet-500 px-5 text-white hover:bg-violet-400 sm:w-auto"
                >
                  <Link href="/downloads">
                    {messages.account.downloadsAction}
                    <DownloadIcon className="size-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-11 w-full justify-between border-white/10 bg-white/5 px-5 text-zinc-100 hover:bg-white/10 sm:w-auto"
                >
                  <Link href="/rankings">
                    {messages.account.rankingsAction}
                    <TrophyIcon className="size-4" />
                  </Link>
                </Button>
                <form action={logoutAction} className="w-full sm:w-auto">
                  <Button
                    type="submit"
                    size="lg"
                    variant="outline"
                    className="h-11 w-full justify-between border-white/10 bg-white/5 px-5 text-zinc-100 hover:bg-white/10 sm:w-auto"
                  >
                    {messages.account.signOutAction}
                    <LogOutIcon className="size-4" />
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </section>

        <DashboardSection
          title={messages.account.playerHubTitle}
          contentClassName="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]"
        >
          <Card className="site-surface h-full rounded-[24px] bg-transparent py-0 shadow-none ring-0">
            <CardHeader className="space-y-3 px-5 pt-5 sm:px-6 sm:pt-6">
              <CardTitle className="text-xl text-white">{messages.account.featuredCharacterTitle}</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 sm:px-6 sm:pb-6">
              {featuredCharacter ? (
                <div className="space-y-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <Link
                        href={`/characters/${featuredCharacter.id}`}
                        className="text-2xl font-semibold tracking-tight text-white transition-colors hover:text-violet-200"
                      >
                        {safeFeaturedCharacterName}
                      </Link>
                      <p className="mt-1 text-sm text-zinc-400">{featuredCharacter.classLabel}</p>
                    </div>
                    <Button
                      asChild
                      variant="outline"
                      className="h-10 w-full rounded-2xl border-white/10 bg-white/5 text-zinc-100 hover:bg-white/10 sm:w-auto"
                    >
                      <Link href={`/characters/${featuredCharacter.id}`}>{messages.account.openCharacterProfile}</Link>
                    </Button>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <div className="site-inset rounded-2xl px-4 py-4">
                      <p className="text-[0.72rem] uppercase tracking-[0.14em] text-zinc-500">
                        {messages.rankings.columns.level}
                      </p>
                      <p className="mt-1 text-sm font-medium text-zinc-100">{featuredCharacter.level}</p>
                    </div>
                    <div className="site-inset rounded-2xl px-4 py-4">
                      <p className="text-[0.72rem] uppercase tracking-[0.14em] text-zinc-500">
                        {messages.rankings.columns.playtime}
                      </p>
                      <p className="mt-1 text-sm font-medium text-zinc-100">
                        {formatPlaytimeDuration(featuredCharacter.playtime, locale)}
                      </p>
                    </div>
                    <div className="site-inset rounded-2xl px-4 py-4">
                      <p className="text-[0.72rem] uppercase tracking-[0.14em] text-zinc-500">
                        {messages.rankings.columns.guild}
                      </p>
                      <p className="mt-1 text-sm font-medium text-zinc-100">
                        {safeFeaturedCharacterGuildName || messages.common.noValue}
                      </p>
                    </div>
                    <div className="site-inset rounded-2xl px-4 py-4">
                      <p className="text-[0.72rem] uppercase tracking-[0.14em] text-zinc-500">
                        {messages.rankings.columns.lastSeen}
                      </p>
                      <p className="mt-1 text-sm font-medium text-zinc-100">
                        {formatRankingTimestamp(featuredCharacter.lastPlay, new Date(), locale)}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <Alert className="border-white/10 bg-black/20 text-zinc-100">
                  <ShieldAlertIcon className="size-4" />
                  <AlertTitle>{messages.account.noCharactersTitle}</AlertTitle>
                  <AlertDescription className="text-zinc-400">
                    {messages.account.noCharactersDescription}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card className="site-surface h-full rounded-[24px] bg-transparent py-0 shadow-none ring-0">
            <CardHeader className="space-y-3 px-5 pt-5 sm:px-6 sm:pt-6">
              <CardTitle className="text-xl text-white">{messages.account.readyTitle}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 px-5 pb-5 sm:px-6 sm:pb-6">
              <div className="grid gap-3 md:grid-cols-3">
                <div className="site-inset rounded-2xl px-4 py-4">
                  <p className="text-[0.72rem] uppercase tracking-[0.14em] text-zinc-500">
                    {messages.account.charactersTitle}
                  </p>
                  <p className="mt-1 text-sm font-medium text-zinc-100">
                    {accountCharactersOverview.status === "available"
                      ? accountCharactersOverview.characters.length
                      : messages.common.noValue}
                  </p>
                </div>
                <div className="site-inset rounded-2xl px-4 py-4">
                  <p className="text-[0.72rem] uppercase tracking-[0.14em] text-zinc-500">
                    {messages.common.lastPlay}
                  </p>
                  <p className="mt-1 text-sm font-medium text-zinc-100">{formattedLastPlay}</p>
                </div>
                <div className="site-inset rounded-2xl px-4 py-4">
                  <p className="text-[0.72rem] uppercase tracking-[0.14em] text-zinc-500">
                    {messages.account.previousLoginIpTitle}
                  </p>
                  <p className="mt-1 break-all text-sm font-medium text-zinc-100">
                    {previousSuccessfulSignInLabel || messages.common.noValue}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </DashboardSection>

        <DashboardSection
          title={messages.account.securitySummaryTitle}
          contentClassName="grid gap-3 md:grid-cols-2 xl:grid-cols-4"
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
          title={messages.account.accountDetailsTitle}
          contentClassName="grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]"
        >
          <ProfileSettingsForm
            login={safeAccountLogin}
            status={safeAccountStatus}
            email={safeAccountEmail ?? ""}
            socialId={safeAccountSocialId}
          />

          <Card className="site-surface rounded-[24px] bg-transparent py-0 shadow-none ring-0">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl text-white">{messages.common.gameAccount}</CardTitle>
              <CardDescription className="text-sm leading-6 text-zinc-400">
                {messages.common.readOnly}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <div className="site-inset rounded-3xl border-white/10 px-4 py-4">
                <div className="flex items-center gap-2 text-zinc-400">
                  <WalletIcon className="size-4" />
                  <p className="text-[0.72rem] uppercase tracking-[0.14em]">{messages.common.cash}</p>
                </div>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-white">{account.cash}</p>
              </div>
              <div className="site-inset rounded-3xl border-white/10 px-4 py-4">
                <div className="flex items-center gap-2 text-zinc-400">
                  <CoinsIcon className="size-4" />
                  <p className="text-[0.72rem] uppercase tracking-[0.14em]">{messages.common.mileage}</p>
                </div>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-white">{account.mileage}</p>
              </div>
              <div className="site-inset rounded-3xl border-white/10 px-4 py-4">
                <div className="flex items-center gap-2 text-zinc-400">
                  <ShieldCheckIcon className="size-4" />
                  <p className="text-[0.72rem] uppercase tracking-[0.14em]">{messages.common.status}</p>
                </div>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-white">{safeAccountStatus}</p>
              </div>
              <div className="site-inset rounded-3xl border-white/10 px-4 py-4">
                <div className="flex items-center gap-2 text-zinc-400">
                  <SparklesIcon className="size-4" />
                  <p className="text-[0.72rem] uppercase tracking-[0.14em]">{messages.common.lastPlay}</p>
                </div>
                <p className="mt-2 text-base font-semibold tracking-tight text-white">
                  {formattedLastPlay}
                </p>
              </div>
            </CardContent>
          </Card>
        </DashboardSection>

        <DashboardSection
          title={messages.account.charactersTitle}
          contentClassName="grid gap-3 md:grid-cols-2 xl:grid-cols-3"
        >
          {accountCharactersOverview.status === "unavailable" ? (
            <Alert className="border-white/10 bg-black/20 text-zinc-100 md:col-span-2 xl:col-span-3">
              <ShieldAlertIcon className="size-4" />
              <AlertTitle>{messages.account.charactersUnavailableTitle}</AlertTitle>
              <AlertDescription className="text-zinc-400">
                {accountCharactersOverview.message}
              </AlertDescription>
            </Alert>
          ) : accountCharactersOverview.characters.length > 0 ? (
            accountCharactersOverview.characters.map((character) => (
              <AccountCharacterCard key={character.id} character={character} locale={locale} />
            ))
          ) : (
            <Alert className="border-white/10 bg-black/20 text-zinc-100 md:col-span-2 xl:col-span-3">
              <ShieldCheckIcon className="size-4" />
              <AlertTitle>{messages.account.noCharactersTitle}</AlertTitle>
              <AlertDescription className="text-zinc-400">
                {messages.account.noCharactersDescription}
              </AlertDescription>
            </Alert>
          )}
        </DashboardSection>

        <DashboardSection
          title={messages.account.securityTitle}
          contentClassName="grid gap-3 xl:grid-cols-[minmax(320px,0.85fr)_minmax(0,1.15fr)]"
        >
          <ChangePasswordForm />

          <Card className="site-surface rounded-[24px] bg-transparent py-0 shadow-none ring-0">
            <CardHeader className="space-y-2 px-5 pt-5 sm:px-6 sm:pt-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle className="text-xl text-white">{messages.account.sessionsTitle}</CardTitle>
                </div>
                {otherActiveSessions.length > 0 ? (
                  <form action={closeOtherSessionsAction}>
                    <Button
                      type="submit"
                      variant="outline"
                      className="border-white/10 bg-white/5 text-zinc-100 hover:bg-white/10"
                    >
                      {messages.common.closeOtherSessions}
                    </Button>
                  </form>
                ) : null}
              </div>
            </CardHeader>
            <CardContent className="space-y-5 px-5 pb-5 sm:px-6 sm:pb-6">
              {currentActiveSession ? (
                <SessionCard
                  session={currentActiveSession}
                  isCurrent
                  ipGeo={ipGeoByIp.get(normalizeIpLookupKey(currentActiveSession.ip) ?? "") ?? null}
                />
              ) : null}

              {otherActiveSessions.length > 0 ? (
                <>
                  <div className="space-y-3">
                    {visibleOtherActiveSessions.map((activeSession) => (
                      <SessionCard
                        key={activeSession.id}
                        session={activeSession}
                        isCurrent={false}
                        ipGeo={ipGeoByIp.get(normalizeIpLookupKey(activeSession.ip) ?? "") ?? null}
                      />
                    ))}
                  </div>

                  {hasPreviousSessionsPage || hasNextSessionsPage ? (
                    <div className="flex flex-wrap gap-3 pt-1">
                      {hasPreviousSessionsPage ? (
                        <Button
                          asChild
                          variant="outline"
                          className="border-white/10 bg-white/5 text-zinc-100 hover:bg-white/10"
                        >
                          <Link href={buildAccountPageHref(resolvedSearchParams, "sessionsPage", visibleSessionsPage - 1)}>
                            {messages.common.previousPage}
                          </Link>
                        </Button>
                      ) : null}

                      {hasNextSessionsPage ? (
                        <Button
                          asChild
                          variant="outline"
                          className="border-white/10 bg-white/5 text-zinc-100 hover:bg-white/10"
                        >
                          <Link href={buildAccountPageHref(resolvedSearchParams, "sessionsPage", visibleSessionsPage + 1)}>
                            {messages.common.nextPage}
                          </Link>
                        </Button>
                      ) : null}
                    </div>
                  ) : null}
                </>
              ) : (
                <Alert className="border-white/10 bg-black/20 text-zinc-100">
                  <ShieldCheckIcon className="size-4" />
                  <AlertTitle>{messages.account.noOtherSessionsTitle}</AlertTitle>
                  <AlertDescription className="text-zinc-400">
                    {messages.account.noOtherSessionsDescription}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </DashboardSection>

        <DashboardSection
          title={messages.account.activityTitle}
          contentClassName="space-y-3"
        >
          {visibleAuthActivity.length > 0 ? (
            visibleAuthActivity.map((entry) => (
              <ActivityRow
                key={entry.id}
                entry={entry}
                ipGeo={ipGeoByIp.get(normalizeIpLookupKey(entry.ip) ?? "") ?? null}
              />
            ))
          ) : (
            <Alert className="border-white/10 bg-white/[0.04] text-zinc-100">
              <SparklesIcon className="size-4" />
              <AlertTitle>{messages.account.noRecentActivityTitle}</AlertTitle>
              <AlertDescription className="text-zinc-400">
                {messages.account.noRecentActivityDescription}
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
                  <Link href={buildAccountPageHref(resolvedSearchParams, "activityPage", activityPage - 1)}>
                    {messages.common.newerActivity}
                  </Link>
                </Button>
              ) : null}

              {hasNextActivityPage ? (
                <Button
                  asChild
                  variant="outline"
                  className="border-white/10 bg-white/5 text-zinc-100 hover:bg-white/10"
                >
                  <Link href={buildAccountPageHref(resolvedSearchParams, "activityPage", activityPage + 1)}>
                    {messages.common.olderActivity}
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
