import Link from "next/link";
import { AlertTriangleIcon, ArrowRightIcon, DownloadIcon, ShieldCheckIcon, UserRoundPlusIcon } from "lucide-react";

import { PublicSection } from "@/components/cms/public-section";
import { SitePageShell } from "@/components/cms/site-page-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const topPlayers = rankingOverview.status === "available" ? rankingOverview.players.slice(0, 3) : [];
  const championGuild = rankingOverview.status === "available" ? rankingOverview.guilds[0] ?? null : null;
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
            description={messages.rankings.characterDescription}
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
                        className="group rounded-[24px] border border-white/10 bg-black/20 p-5 transition duration-200 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.06] hover:shadow-2xl hover:shadow-black/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60"
                      >
                        <div className="space-y-4">
                          <div className="flex items-center justify-between gap-3">
                            <span className="rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-violet-100">
                              #{player.rank}
                            </span>
                            <span className="text-sm text-zinc-400">{formatRankingTimestamp(player.lastPlay, new Date(), locale)}</span>
                          </div>
                          <div className="space-y-1">
                            <div className="text-xl font-semibold text-white">{player.name}</div>
                            <div className="text-sm text-zinc-400">{player.classLabel}</div>
                          </div>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-2xl border border-white/8 bg-white/5 px-3 py-3">
                              <div className="text-[0.72rem] uppercase tracking-[0.14em] text-zinc-500">
                                {messages.rankings.columns.level}
                              </div>
                              <div className="mt-1 text-sm font-medium text-zinc-100">
                                {formatInteger(player.level, locale)}
                              </div>
                            </div>
                            <div className="rounded-2xl border border-white/8 bg-white/5 px-3 py-3">
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

                <div className="overflow-hidden rounded-[24px] border border-white/10 bg-black/20">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-white/10 text-left text-sm text-zinc-300">
                      <thead className="bg-white/5 text-xs uppercase tracking-[0.16em] text-zinc-500">
                        <tr>
                          <th className="px-4 py-3 font-medium">{messages.rankings.columns.rank}</th>
                          <th className="px-4 py-3 font-medium">{messages.rankings.columns.character}</th>
                          <th className="px-4 py-3 font-medium">{messages.rankings.columns.class}</th>
                          <th className="px-4 py-3 font-medium">{messages.rankings.columns.level}</th>
                          <th className="px-4 py-3 font-medium">{messages.rankings.columns.exp}</th>
                          <th className="px-4 py-3 font-medium">{messages.rankings.columns.playtime}</th>
                          <th className="px-4 py-3 font-medium">{messages.rankings.columns.guild}</th>
                          <th className="px-4 py-3 font-medium">{messages.rankings.columns.lastSeen}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/8">
                        {rankingOverview.players.map((player) => (
                          <tr key={player.id} className="bg-transparent transition-colors hover:bg-white/[0.03]">
                            <td className="px-4 py-3 align-top text-zinc-500">{player.rank}</td>
                            <td className="px-4 py-3 align-top font-medium text-white">
                              <Link href={`/characters/${player.id}`} className="transition-colors hover:text-violet-200">
                                {player.name}
                              </Link>
                            </td>
                            <td className="px-4 py-3 align-top">{player.classLabel}</td>
                            <td className="px-4 py-3 align-top">{formatInteger(player.level, locale)}</td>
                            <td className="px-4 py-3 align-top">{formatInteger(player.exp, locale)}</td>
                            <td className="px-4 py-3 align-top">{formatPlaytimeDuration(player.playtime, locale)}</td>
                            <td className="px-4 py-3 align-top">{player.guildName || "—"}</td>
                            <td className="px-4 py-3 align-top">{formatRankingTimestamp(player.lastPlay, new Date(), locale)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
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
            description={messages.rankings.guildDescription}
          >
            {rankingOverview.guilds.length > 0 ? (
              <div className="space-y-4">
                {championGuild ? (
                  <Card className="border-white/10 bg-black/20 shadow-none">
                    <CardHeader className="space-y-2">
                      <div className="text-sm font-medium uppercase tracking-[0.16em] text-zinc-500">
                        {messages.rankings.guildChampionTitle}
                      </div>
                      <CardTitle className="text-xl text-white">{championGuild.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
                        <div className="text-[0.72rem] uppercase tracking-[0.14em] text-zinc-500">
                          {messages.rankings.columns.ladder}
                        </div>
                        <div className="mt-1 text-sm font-medium text-zinc-100">
                          {formatInteger(championGuild.ladderPoint, locale)}
                        </div>
                      </div>
                      <div className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
                        <div className="text-[0.72rem] uppercase tracking-[0.14em] text-zinc-500">
                          {messages.rankings.columns.level}
                        </div>
                        <div className="mt-1 text-sm font-medium text-zinc-100">
                          {formatInteger(championGuild.level, locale)}
                        </div>
                      </div>
                      <div className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
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

                <div className="overflow-hidden rounded-[24px] border border-white/10 bg-black/20">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-white/10 text-left text-sm text-zinc-300">
                      <thead className="bg-white/5 text-xs uppercase tracking-[0.16em] text-zinc-500">
                        <tr>
                          <th className="px-4 py-3 font-medium">{messages.rankings.columns.rank}</th>
                          <th className="px-4 py-3 font-medium">{messages.rankings.columns.guild}</th>
                          <th className="px-4 py-3 font-medium">{messages.rankings.columns.ladder}</th>
                          <th className="px-4 py-3 font-medium">{messages.rankings.columns.level}</th>
                          <th className="px-4 py-3 font-medium">{messages.rankings.columns.record}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/8">
                        {rankingOverview.guilds.map((guild) => (
                          <tr key={guild.id} className="bg-transparent transition-colors hover:bg-white/[0.03]">
                            <td className="px-4 py-3 align-top text-zinc-500">{guild.rank}</td>
                            <td className="px-4 py-3 align-top font-medium text-white">{guild.name}</td>
                            <td className="px-4 py-3 align-top">{formatInteger(guild.ladderPoint, locale)}</td>
                            <td className="px-4 py-3 align-top">{formatInteger(guild.level, locale)}</td>
                            <td className="px-4 py-3 align-top">{`${formatInteger(guild.win, locale)}-${formatInteger(guild.draw, locale)}-${formatInteger(guild.loss, locale)}`}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
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
        description={messages.rankings.nextDescription}
      >
        <div className="grid gap-4 md:grid-cols-3">
          {nextRoutes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              data-slot="route-card"
              className="group flex h-full flex-col justify-between gap-6 rounded-[24px] border border-white/10 bg-black/20 p-5 text-left transition duration-200 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.06] hover:shadow-2xl hover:shadow-black/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60"
            >
              <div className="space-y-4">
                <div className="flex size-10 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-violet-200 transition-colors group-hover:border-violet-300/30 group-hover:bg-violet-500/20 group-hover:text-violet-100">
                  {route.icon}
                </div>
                <div className="space-y-2">
                  <div className="text-lg font-medium text-white">{route.title}</div>
                  <div className="text-sm leading-6 text-zinc-400 group-hover:text-zinc-300">{route.description}</div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 text-sm text-zinc-300 transition-colors group-hover:text-white">
                <span>{route.label}</span>
                <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </PublicSection>
    </SitePageShell>
  );
}
