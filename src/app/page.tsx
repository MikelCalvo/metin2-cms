import type { ReactNode } from "react";

import Link from "next/link";
import { ActivityIcon, ArrowRightIcon, DownloadIcon, ShieldIcon, TrophyIcon, UserRoundPlusIcon } from "lucide-react";

import { PlatformChip } from "@/components/cms/platform-chip";
import { PublicActionTile } from "@/components/cms/public-action-tile";
import { CmsPageHeader } from "@/components/cms/page-shell";
import { PublicSection } from "@/components/cms/public-section";
import { SitePageShell } from "@/components/cms/site-page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getIntlLocale, type Locale } from "@/lib/i18n/config";
import { getCurrentLocale, getMessagesForRequest } from "@/lib/i18n/server";
import { getRankingOverview } from "@/server/rankings/rankings-service";

function WarriorClassIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-4" stroke="currentColor" strokeWidth="1.8">
      <path d="M7 6 4.5 8.5 9 13l2-2-4-5Z" />
      <path d="m17 6 2.5 2.5L15 13l-2-2 4-5Z" />
      <path d="m10.5 12.5-4 4" strokeLinecap="round" />
      <path d="m13.5 12.5 4 4" strokeLinecap="round" />
    </svg>
  );
}

function NinjaClassIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-4" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 4 13.9 10.1 20 12l-6.1 1.9L12 20l-1.9-6.1L4 12l6.1-1.9L12 4Z" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

function SuraClassIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-4" stroke="currentColor" strokeWidth="1.7">
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 4v2.5M12 17.5V20M4 12h2.5M17.5 12H20" strokeLinecap="round" />
      <path d="m12 8 1.4 2.6 2.6 1.4-2.6 1.4L12 16l-1.4-2.6L8 12l2.6-1.4L12 8Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

function ShamanClassIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-4" stroke="currentColor" strokeWidth="1.6">
      <path d="M12 4 13.3 7.2 16.5 8.5 13.3 9.8 12 13 10.7 9.8 7.5 8.5 10.7 7.2 12 4Z" fill="currentColor" stroke="none" />
      <path d="M18 13.5 18.8 15.5 20.8 16.3 18.8 17.1 18 19.1 17.2 17.1 15.2 16.3 17.2 15.5 18 13.5Z" fill="currentColor" stroke="none" opacity="0.85" />
      <path d="M6 14.5 6.7 16.1 8.3 16.8 6.7 17.5 6 19.1 5.3 17.5 3.7 16.8 5.3 16.1 6 14.5Z" fill="currentColor" stroke="none" opacity="0.75" />
    </svg>
  );
}

function ClassFlavorChip({
  accentClassName,
  icon,
  label,
}: {
  accentClassName: string;
  icon: ReactNode;
  label: string;
}) {
  return (
    <div data-slot="identity-class-chip" className="site-inset flex items-center gap-3 rounded-2xl px-3.5 py-3.5">
      <div
        className={`flex size-10 shrink-0 items-center justify-center rounded-2xl border shadow-sm shadow-black/10 ${accentClassName}`}
      >
        {icon}
      </div>
      <div className="min-w-0 text-sm font-medium text-zinc-100">{label}</div>
    </div>
  );
}

function IdentityHighlightRow({
  detail,
  metric,
  name,
  rank,
  slot,
}: {
  detail: string;
  metric: string;
  name: string;
  rank: number;
  slot: string;
}) {
  return (
    <div data-slot={slot} className="site-inset flex items-center justify-between gap-3 rounded-2xl px-4 py-3.5">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-100">
          <span className="text-zinc-500">#{rank}</span>
          <span className="truncate">{name}</span>
        </div>
        <p className="mt-1 text-xs text-zinc-400">{detail}</p>
      </div>
      <div className="shrink-0 text-right text-sm text-zinc-300">{metric}</div>
    </div>
  );
}

function IdentityEmptyState({ message }: { message: string }) {
  return <div className="site-inset rounded-2xl px-4 py-4 text-sm text-zinc-400">{message}</div>;
}

function formatInteger(value: number, locale: Locale) {
  return new Intl.NumberFormat(getIntlLocale(locale)).format(value);
}

export default async function Home() {
  const locale = await getCurrentLocale();
  const messages = await getMessagesForRequest();
  const rankingOverview = await getRankingOverview(locale);
  const topPlayers = rankingOverview.status === "available" ? rankingOverview.players.slice(0, 3) : [];
  const topGuilds = rankingOverview.status === "available" ? rankingOverview.guilds.slice(0, 3) : [];
  const championGuild = topGuilds[0] ?? null;
  const classChips = [
    {
      key: "warrior",
      label: messages.rankingsMeta.classes.warrior,
      icon: <WarriorClassIcon />,
      accentClassName: "border-amber-300/25 bg-amber-500/14 text-amber-100",
    },
    {
      key: "ninja",
      label: messages.rankingsMeta.classes.ninja,
      icon: <NinjaClassIcon />,
      accentClassName: "border-sky-300/25 bg-sky-500/12 text-sky-100",
    },
    {
      key: "sura",
      label: messages.rankingsMeta.classes.sura,
      icon: <SuraClassIcon />,
      accentClassName: "border-violet-300/25 bg-violet-500/14 text-violet-100",
    },
    {
      key: "shaman",
      label: messages.rankingsMeta.classes.shaman,
      icon: <ShamanClassIcon />,
      accentClassName: "border-emerald-300/25 bg-emerald-500/12 text-emerald-100",
    },
  ] as const;
  const quickRoutes = [
    {
      title: messages.home.routes.playNowTitle,
      description: messages.home.routes.playNowDescription,
      href: "/downloads",
      label: messages.home.routes.playNowLabel,
      icon: <DownloadIcon className="size-4" />,
    },
    {
      title: messages.home.routes.createAccountTitle,
      description: messages.home.routes.createAccountDescription,
      href: "/register",
      label: messages.common.createAccount,
      icon: <UserRoundPlusIcon className="size-4" />,
    },
    {
      title: messages.home.routes.rankingsTitle,
      description: messages.home.routes.rankingsDescription,
      href: "/rankings",
      label: messages.home.routes.rankingsLabel,
      icon: <TrophyIcon className="size-4" />,
    },
  ] as const;

  return (
    <SitePageShell>
      <CmsPageHeader
        title={
          <>
            <span className="block">{messages.home.heroLineOne}</span>
            <span className="block">{messages.home.heroLineTwo}</span>
          </>
        }
        description={messages.home.description}
      >
        <div className="flex w-full flex-col gap-3 pt-2 sm:flex-row">
          <Link
            href="/downloads"
            className="site-inset group inline-flex items-center justify-between gap-4 rounded-2xl px-4 py-3 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/[0.12]"
          >
            <span className="flex items-center gap-3">
              <DownloadIcon className="size-4 text-zinc-200" />
              {messages.common.downloadLauncher}
            </span>
            <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>

          <Link
            href="/register"
            className="site-inset group inline-flex items-center justify-between gap-4 rounded-2xl px-4 py-3 text-sm font-medium text-zinc-100 transition hover:border-white/20 hover:bg-white/[0.08]"
          >
            <span className="flex items-center gap-3">
              <UserRoundPlusIcon className="size-4 text-zinc-300" />
              {messages.common.createAccount}
            </span>
            <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <PlatformChip platform="windows" label={messages.common.windows} />
        <PlatformChip platform="linux" label={messages.common.linux} note={messages.common.wine} />
      </CmsPageHeader>

      <PublicSection
        eyebrow={messages.home.liveEyebrow}
        title={messages.home.liveTitle}
        description={messages.home.liveDescription}
      >
        {rankingOverview.status === "available" ? (
          <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <Card className="site-surface rounded-[24px] bg-transparent py-0 shadow-none ring-0">
              <CardHeader className="space-y-3">
                <div className="site-inset flex size-10 items-center justify-center rounded-2xl text-emerald-200">
                  <ActivityIcon className="size-4" />
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-lg text-white">{messages.home.liveBoardTitle}</CardTitle>
                  <CardDescription className="text-sm leading-6 text-zinc-400">
                    {messages.home.liveBoardDescription}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-zinc-300">
                <div className="site-inset rounded-2xl px-4 py-3">
                  {messages.home.visiblePlayersCount(topPlayers.length)}
                </div>
                <div className="site-inset rounded-2xl px-4 py-3">
                  {messages.home.visibleGuildsCount(rankingOverview.guilds.length)}
                </div>
              </CardContent>
            </Card>

            <Card className="site-surface rounded-[24px] bg-transparent py-0 shadow-none ring-0">
              <CardHeader className="space-y-3">
                <div className="site-inset flex size-10 items-center justify-center rounded-2xl text-violet-200">
                  <TrophyIcon className="size-4" />
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-lg text-white">{messages.home.topPlayersTitle}</CardTitle>
                  <CardDescription className="text-sm leading-6 text-zinc-400">
                    {messages.home.topPlayersDescription}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {topPlayers.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-white/5 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-sm font-medium text-white">
                        <span className="text-zinc-500">#{player.rank}</span>
                        <span className="truncate">{player.name}</span>
                      </div>
                      <p className="text-sm text-zinc-400">{player.classLabel}</p>
                    </div>
                    <div className="text-right text-sm text-zinc-300">Lv {formatInteger(player.level, locale)}</div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="site-surface rounded-[24px] bg-transparent py-0 shadow-none ring-0">
              <CardHeader className="space-y-3">
                <div className="site-inset flex size-10 items-center justify-center rounded-2xl text-amber-200">
                  <ShieldIcon className="size-4" />
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-lg text-white">{messages.home.championGuildTitle}</CardTitle>
                  <CardDescription className="text-sm leading-6 text-zinc-400">
                    {messages.home.championGuildDescription}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {championGuild ? (
                  <div className="space-y-3 rounded-2xl border border-white/8 bg-white/5 px-4 py-4">
                    <div className="text-lg font-semibold text-white">{championGuild.name}</div>
                    <div className="text-sm text-zinc-300">
                      {formatInteger(championGuild.ladderPoint, locale)} ladder
                    </div>
                    <div className="text-sm text-zinc-400">
                      {championGuild.win}-{championGuild.draw}-{championGuild.loss}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-white/8 bg-white/5 px-4 py-4 text-sm text-zinc-400">
                    {messages.home.championGuildEmpty}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : null}
      </PublicSection>

      <PublicSection
        eyebrow={messages.home.identityEyebrow}
        title={messages.home.identityTitle}
        description={messages.home.identityDescription}
      >
        <div className="grid gap-5 md:grid-cols-3">
          <Card className="site-surface h-full rounded-[24px] bg-transparent py-0 shadow-none ring-0">
            <CardHeader className="space-y-4 px-5 pt-5 sm:px-6 sm:pt-6">
              <div className="site-inset flex size-11 items-center justify-center rounded-2xl text-zinc-100">
                <ShieldIcon className="size-4" />
              </div>
              <div className="space-y-2">
                <CardTitle className="text-lg text-white">{messages.home.identityClassesTitle}</CardTitle>
                <CardDescription className="text-sm leading-6 text-zinc-400">
                  {messages.home.identityClassesDescription}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3 px-5 pb-5 sm:px-6 sm:pb-6">
              {classChips.map((classChip) => (
                <ClassFlavorChip
                  key={classChip.key}
                  accentClassName={classChip.accentClassName}
                  icon={classChip.icon}
                  label={classChip.label}
                />
              ))}
            </CardContent>
          </Card>

          <Card className="site-surface h-full rounded-[24px] bg-transparent py-0 shadow-none ring-0">
            <CardHeader className="space-y-4 px-5 pt-5 sm:px-6 sm:pt-6">
              <div className="site-inset flex size-11 items-center justify-center rounded-2xl text-violet-200">
                <TrophyIcon className="size-4" />
              </div>
              <div className="space-y-2">
                <CardTitle className="text-lg text-white">{messages.home.identityGuildWarsTitle}</CardTitle>
                <CardDescription className="text-sm leading-6 text-zinc-400">
                  {messages.home.identityGuildWarsDescription}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 px-5 pb-5 sm:px-6 sm:pb-6">
              <p className="text-[0.72rem] uppercase tracking-[0.16em] text-zinc-500">{messages.home.topGuildsTitle}</p>
              {topGuilds.length > 0 ? (
                topGuilds.map((guild) => (
                  <IdentityHighlightRow
                    key={guild.id}
                    detail={`${guild.win}-${guild.draw}-${guild.loss}`}
                    metric={`${formatInteger(guild.ladderPoint, locale)} LP`}
                    name={guild.name}
                    rank={guild.rank}
                    slot="identity-guild-row"
                  />
                ))
              ) : (
                <IdentityEmptyState message={messages.home.identityGuildWarsEmpty} />
              )}
            </CardContent>
          </Card>

          <Card className="site-surface h-full rounded-[24px] bg-transparent py-0 shadow-none ring-0">
            <CardHeader className="space-y-4 px-5 pt-5 sm:px-6 sm:pt-6">
              <div className="site-inset flex size-11 items-center justify-center rounded-2xl text-amber-200">
                <ActivityIcon className="size-4" />
              </div>
              <div className="space-y-2">
                <CardTitle className="text-lg text-white">{messages.home.identityBossRunsTitle}</CardTitle>
                <CardDescription className="text-sm leading-6 text-zinc-400">
                  {messages.home.identityBossRunsDescription}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 px-5 pb-5 sm:px-6 sm:pb-6">
              <p className="text-[0.72rem] uppercase tracking-[0.16em] text-zinc-500">{messages.home.topPlayersTitle}</p>
              {topPlayers.length > 0 ? (
                topPlayers.map((player) => (
                  <IdentityHighlightRow
                    key={player.id}
                    detail={player.classLabel}
                    metric={`Lv ${formatInteger(player.level, locale)}`}
                    name={player.name}
                    rank={player.rank}
                    slot="identity-player-row"
                  />
                ))
              ) : (
                <IdentityEmptyState message={messages.home.identityBossRunsEmpty} />
              )}
            </CardContent>
          </Card>
        </div>
      </PublicSection>

      <PublicSection
        eyebrow={messages.home.sectionEyebrow}
        title={messages.home.sectionTitle}
        description={messages.home.sectionDescription}
      >
        <div className="grid gap-4 md:grid-cols-3">
          {quickRoutes.map((route) => (
            <PublicActionTile
              key={route.href}
              href={route.href}
              title={route.title}
              description={route.description}
              label={route.label}
              icon={route.icon}
            />
          ))}
        </div>
      </PublicSection>
    </SitePageShell>
  );
}
