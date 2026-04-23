import Link from "next/link";
import { AlertTriangleIcon, ArrowRightIcon, DownloadIcon, ShieldCheckIcon, UserRoundPlusIcon } from "lucide-react";

import { PublicActionTile } from "@/components/cms/public-action-tile";
import { PublicDataTable } from "@/components/cms/public-data-table";
import { PublicSection } from "@/components/cms/public-section";
import { SitePageShell } from "@/components/cms/site-page-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { sanitizeDisplayText, sanitizeOptionalDisplayText } from "@/lib/display-text";
import { getCurrentLocale, getMessagesForRequest } from "@/lib/i18n/server";
import { formatPlaytimeDuration, formatRankingTimestamp } from "@/server/rankings/rankings-formatters";
import { getRankingOverview } from "@/server/rankings/rankings-service";

export const dynamic = "force-dynamic";

function formatInteger(value: number | null, locale: string) {
  if (value === null) {
    return "—";
  }

  return new Intl.NumberFormat(locale).format(value);
}

export default async function RankingsPage() {
  const locale = await getCurrentLocale();
  const messages = await getMessagesForRequest();
  const rankingOverview = await getRankingOverview(locale);
  const safePlayers =
    rankingOverview.status === "available"
      ? rankingOverview.players.map((player) => ({
          ...player,
          name: sanitizeDisplayText(player.name),
          guildName: sanitizeOptionalDisplayText(player.guildName),
        }))
      : [];
  const safeGuilds =
    rankingOverview.status === "available"
      ? rankingOverview.guilds.map((guild) => ({
          ...guild,
          name: sanitizeDisplayText(guild.name),
        }))
      : [];
  const topPlayers = safePlayers.slice(0, 3);
  const championGuild = safeGuilds[0] ?? null;
  const nextRoutes = [
    {
      title: messages.rankings.routes.createAccountTitle,
      description: messages.rankings.routes.createAccountDescription,
      href: "/register",
      label: messages.common.createAccount,
      icon: <UserRoundPlusIcon className="size-4" />,
    },
    {
      title: messages.rankings.routes.downloadTitle,
      description: messages.rankings.routes.downloadDescription,
      href: "/downloads",
      label: messages.common.openDownloads,
      icon: <DownloadIcon className="size-4" />,
    },
    {
      title: messages.rankings.routes.signInTitle,
      description: messages.rankings.routes.signInDescription,
      href: "/login",
      label: messages.common.signIn,
      icon: <ArrowRightIcon className="size-4" />,
    },
  ] as const;

  return (
    <SitePageShell>
      {rankingOverview.status === "unavailable" ? (
        <PublicSection
          eyebrow={messages.rankings.eyebrow}
          title={messages.rankings.unavailableTitle}
          description={messages.rankings.unavailableDescription}
        >
          <Alert className="border-white/10 bg-black/20 text-zinc-100">
            <AlertTriangleIcon className="size-4" />
            <AlertTitle>{messages.rankings.unavailableAlertTitle}</AlertTitle>
            <AlertDescription className="text-zinc-400">{rankingOverview.message}</AlertDescription>
          </Alert>
        </PublicSection>
      ) : (
        <>
          <PublicSection
            eyebrow={messages.rankings.eyebrow}
            title={messages.rankings.characterTitle}
          >
            {rankingOverview.players.length > 0 ? (
              <div className="space-y-4">
                <div>
                  <div className="mb-3 text-sm font-medium uppercase tracking-[0.16em] text-zinc-500">
                    {messages.rankings.highlightsTitle}
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    {topPlayers.map((player) => (
                      <Link
                        key={player.id}
                        href={`/characters/${player.id}`}
                        data-slot="ranking-highlight-card"
                        className="site-action-tile group rounded-[24px] p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60"
                      >
                        <div className="space-y-4">
                          <div className="flex items-center justify-between gap-3">
                            <span className="site-pill rounded-full px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-violet-100">
                              #{player.rank}
                            </span>
                            <span className="text-sm text-zinc-400">{formatRankingTimestamp(player.lastPlay, new Date(), locale)}</span>
                          </div>
                          <div className="space-y-1">
                            <div className="text-xl font-semibold text-white">{player.name}</div>
                            <div className="text-sm text-zinc-400">{player.classLabel}</div>
                          </div>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="site-inset rounded-2xl px-3 py-3">
                              <div className="text-[0.72rem] uppercase tracking-[0.14em] text-zinc-500">
                                {messages.rankings.columns.level}
                              </div>
                              <div className="mt-1 text-sm font-medium text-zinc-100">
                                {formatInteger(player.level, locale)}
                              </div>
                            </div>
                            <div className="site-inset rounded-2xl px-3 py-3">
                              <div className="text-[0.72rem] uppercase tracking-[0.14em] text-zinc-500">
                                {messages.rankings.columns.playtime}
                              </div>
                              <div className="mt-1 text-sm font-medium text-zinc-100">
                                {formatPlaytimeDuration(player.playtime, locale)}
                              </div>
                            </div>
                          </div>
                          <div className="text-sm text-zinc-300">
                            {player.guildName || messages.common.noValue}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                <PublicDataTable
                  columns={[
                    {
                      key: "rank",
                      header: messages.rankings.columns.rank,
                      cell: (player) => <span className="text-zinc-500">{player.rank}</span>,
                    },
                    {
                      key: "character",
                      header: messages.rankings.columns.character,
                      cell: (player) => (
                        <Link href={`/characters/${player.id}`} className="font-medium text-white transition-colors hover:text-violet-200">
                          {player.name}
                        </Link>
                      ),
                    },
                    {
                      key: "class",
                      header: messages.rankings.columns.class,
                      cell: (player) => player.classLabel,
                    },
                    {
                      key: "level",
                      header: messages.rankings.columns.level,
                      cell: (player) => formatInteger(player.level, locale),
                      align: "right",
                      numeric: true,
                    },
                    {
                      key: "exp",
                      header: messages.rankings.columns.exp,
                      cell: (player) => formatInteger(player.exp, locale),
                      align: "right",
                      numeric: true,
                    },
                    {
                      key: "playtime",
                      header: messages.rankings.columns.playtime,
                      cell: (player) => formatPlaytimeDuration(player.playtime, locale),
                      align: "right",
                      numeric: true,
                    },
                    {
                      key: "guild",
                      header: messages.rankings.columns.guild,
                      cell: (player) => player.guildName || "—",
                    },
                    {
                      key: "lastSeen",
                      header: messages.rankings.columns.lastSeen,
                      cell: (player) => formatRankingTimestamp(player.lastPlay, new Date(), locale),
                      align: "right",
                    },
                  ]}
                  rows={safePlayers}
                  rowKey={(player) => player.id}
                />
              </div>
            ) : (
              <Alert className="border-white/10 bg-black/20 text-zinc-100">
                <ShieldCheckIcon className="size-4" />
                <AlertTitle>{messages.rankings.noCharactersTitle}</AlertTitle>
                <AlertDescription className="text-zinc-400">
                  {messages.rankings.noCharactersDescription}
                </AlertDescription>
              </Alert>
            )}
          </PublicSection>

          <PublicSection
            eyebrow={messages.rankings.guildEyebrow}
            title={messages.rankings.guildTitle}
          >
            {rankingOverview.guilds.length > 0 ? (
              <div className="space-y-4">
                {championGuild ? (
                  <Card className="site-surface rounded-[24px] bg-transparent py-0 shadow-none ring-0">
                    <CardHeader className="space-y-2">
                      <div className="text-sm font-medium uppercase tracking-[0.16em] text-zinc-500">
                        {messages.rankings.guildChampionTitle}
                      </div>
                      <CardTitle className="text-xl text-white">{championGuild.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-3 sm:grid-cols-3">
                      <div className="site-inset rounded-2xl px-4 py-3">
                        <div className="text-[0.72rem] uppercase tracking-[0.14em] text-zinc-500">
                          {messages.rankings.columns.ladder}
                        </div>
                        <div className="mt-1 text-sm font-medium text-zinc-100">
                          {formatInteger(championGuild.ladderPoint, locale)}
                        </div>
                      </div>
                      <div className="site-inset rounded-2xl px-4 py-3">
                        <div className="text-[0.72rem] uppercase tracking-[0.14em] text-zinc-500">
                          {messages.rankings.columns.level}
                        </div>
                        <div className="mt-1 text-sm font-medium text-zinc-100">
                          {formatInteger(championGuild.level, locale)}
                        </div>
                      </div>
                      <div className="site-inset rounded-2xl px-4 py-3">
                        <div className="text-[0.72rem] uppercase tracking-[0.14em] text-zinc-500">
                          {messages.rankings.columns.record}
                        </div>
                        <div className="mt-1 text-sm font-medium text-zinc-100">
                          {`${formatInteger(championGuild.win, locale)}-${formatInteger(championGuild.draw, locale)}-${formatInteger(championGuild.loss, locale)}`}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : null}

                <PublicDataTable
                  columns={[
                    {
                      key: "rank",
                      header: messages.rankings.columns.rank,
                      cell: (guild) => <span className="text-zinc-500">{guild.rank}</span>,
                    },
                    {
                      key: "guild",
                      header: messages.rankings.columns.guild,
                      cell: (guild) => <span className="font-medium text-white">{guild.name}</span>,
                    },
                    {
                      key: "ladder",
                      header: messages.rankings.columns.ladder,
                      cell: (guild) => formatInteger(guild.ladderPoint, locale),
                      align: "right",
                      numeric: true,
                    },
                    {
                      key: "level",
                      header: messages.rankings.columns.level,
                      cell: (guild) => formatInteger(guild.level, locale),
                      align: "right",
                      numeric: true,
                    },
                    {
                      key: "record",
                      header: messages.rankings.columns.record,
                      cell: (guild) => `${formatInteger(guild.win, locale)}-${formatInteger(guild.draw, locale)}-${formatInteger(guild.loss, locale)}`,
                      align: "right",
                      numeric: true,
                    },
                  ]}
                  rows={safeGuilds}
                  rowKey={(guild) => guild.id}
                />
              </div>
            ) : (
              <Alert className="border-white/10 bg-black/20 text-zinc-100">
                <ShieldCheckIcon className="size-4" />
                <AlertTitle>{messages.rankings.noGuildsTitle}</AlertTitle>
                <AlertDescription className="text-zinc-400">
                  {messages.rankings.noGuildsDescription}
                </AlertDescription>
              </Alert>
            )}
          </PublicSection>
        </>
      )}

      <PublicSection
        eyebrow={messages.rankings.nextEyebrow}
        title={messages.rankings.nextTitle}
      >
        <div className="grid gap-4 md:grid-cols-3">
          {nextRoutes.map((route) => (
            <PublicActionTile
              key={route.href}
              href={route.href}
              title={route.title}
              description={route.description}
              label={route.label}
              icon={route.icon}
              dataSlot="route-card"
            />
          ))}
        </div>
      </PublicSection>
    </SitePageShell>
  );
}
