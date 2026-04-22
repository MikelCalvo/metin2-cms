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

function formatInteger(value: number, locale: Locale) {
  return new Intl.NumberFormat(getIntlLocale(locale)).format(value);
}

export default async function Home() {
  const locale = await getCurrentLocale();
  const messages = await getMessagesForRequest();
  const rankingOverview = await getRankingOverview(locale);
  const topPlayers = rankingOverview.status === "available" ? rankingOverview.players.slice(0, 3) : [];
  const championGuild = rankingOverview.status === "available" ? rankingOverview.guilds[0] ?? null : null;
  const classChips = [
    messages.rankingsMeta.classes.warrior,
    messages.rankingsMeta.classes.ninja,
    messages.rankingsMeta.classes.sura,
    messages.rankingsMeta.classes.shaman,
    messages.rankingsMeta.classes.lycan,
  ];
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
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="site-surface rounded-[24px] bg-transparent py-0 shadow-none ring-0">
            <CardHeader className="space-y-3">
              <div className="site-inset flex size-10 items-center justify-center rounded-2xl text-zinc-100">
                <ShieldIcon className="size-4" />
              </div>
              <div className="space-y-2">
                <CardTitle className="text-lg text-white">{messages.home.identityClassesTitle}</CardTitle>
                <CardDescription className="text-sm leading-6 text-zinc-400">
                  {messages.home.identityClassesDescription}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {classChips.map((className) => (
                <span key={className} className="site-pill rounded-full px-3 py-1.5 text-sm text-zinc-100">
                  {className}
                </span>
              ))}
            </CardContent>
          </Card>

          <Card className="site-surface rounded-[24px] bg-transparent py-0 shadow-none ring-0">
            <CardHeader className="space-y-3">
              <div className="site-inset flex size-10 items-center justify-center rounded-2xl text-violet-200">
                <TrophyIcon className="size-4" />
              </div>
              <div className="space-y-2">
                <CardTitle className="text-lg text-white">{messages.home.identityGuildWarsTitle}</CardTitle>
                <CardDescription className="text-sm leading-6 text-zinc-400">
                  {messages.home.identityGuildWarsDescription}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="site-inset rounded-2xl px-4 py-3">
                <p className="text-[0.72rem] uppercase tracking-[0.14em] text-zinc-500">
                  {messages.home.championGuildTitle}
                </p>
                <p className="mt-1 text-sm font-medium text-zinc-100">
                  {championGuild ? championGuild.name : messages.home.championGuildEmpty}
                </p>
              </div>
              <div className="site-inset rounded-2xl px-4 py-3 text-sm text-zinc-300">
                {messages.home.visibleGuildsCount(rankingOverview.status === "available" ? rankingOverview.guilds.length : 0)}
              </div>
            </CardContent>
          </Card>

          <Card className="site-surface rounded-[24px] bg-transparent py-0 shadow-none ring-0">
            <CardHeader className="space-y-3">
              <div className="site-inset flex size-10 items-center justify-center rounded-2xl text-amber-200">
                <ActivityIcon className="size-4" />
              </div>
              <div className="space-y-2">
                <CardTitle className="text-lg text-white">{messages.home.identityBossRunsTitle}</CardTitle>
                <CardDescription className="text-sm leading-6 text-zinc-400">
                  {messages.home.identityBossRunsDescription}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="site-inset rounded-2xl px-4 py-3">
                <p className="text-[0.72rem] uppercase tracking-[0.14em] text-zinc-500">
                  {messages.home.topPlayersTitle}
                </p>
                <p className="mt-1 text-sm font-medium text-zinc-100">
                  {topPlayers[0]?.name ?? messages.home.liveBoardTitle}
                </p>
              </div>
              <div className="site-inset rounded-2xl px-4 py-3 text-sm text-zinc-300">
                {messages.home.identityBossRunsStatus}
              </div>
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
