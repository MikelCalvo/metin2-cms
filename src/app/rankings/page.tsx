import Link from "next/link";
import { AlertTriangleIcon, ArrowRightIcon, DownloadIcon, ShieldCheckIcon, UserRoundPlusIcon } from "lucide-react";

import { PublicSection } from "@/components/cms/public-section";
import { SitePageShell } from "@/components/cms/site-page-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRankingTimestamp } from "@/server/rankings/rankings-formatters";
import { getRankingOverview } from "@/server/rankings/rankings-service";

export const dynamic = "force-dynamic";

const integerFormatter = new Intl.NumberFormat("en-US");

const nextRoutes = [
  {
    title: "Create account",
    description: "Get your login ready.",
    href: "/register",
    label: "Create account",
    icon: <UserRoundPlusIcon className="size-4" />,
  },
  {
    title: "Download starter pack",
    description: "Grab the launcher and client.",
    href: "/downloads",
    label: "Open downloads",
    icon: <DownloadIcon className="size-4" />,
  },
  {
    title: "First launch",
    description: "Shortest path to first login.",
    href: "/getting-started",
    label: "View getting started",
    icon: <ArrowRightIcon className="size-4" />,
  },
] as const;

function formatInteger(value: number | null) {
  if (value === null) {
    return "—";
  }

  return integerFormatter.format(value);
}

export default async function RankingsPage() {
  const rankingOverview = await getRankingOverview();

  return (
    <SitePageShell>
      {rankingOverview.status === "unavailable" ? (
        <PublicSection eyebrow="Rankings" title="Live rankings unavailable" description="Try again in a moment.">
          <Alert className="border-white/10 bg-black/20 text-zinc-100">
            <AlertTriangleIcon className="size-4" />
            <AlertTitle>Ranking feed unavailable</AlertTitle>
            <AlertDescription className="text-zinc-400">{rankingOverview.message}</AlertDescription>
          </Alert>
        </PublicSection>
      ) : (
        <>
          <PublicSection eyebrow="Rankings" title="Character ladder" description="Top characters on the live server.">
            {rankingOverview.players.length > 0 ? (
              <div className="overflow-hidden rounded-[24px] border border-white/10 bg-black/20">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-white/10 text-left text-sm text-zinc-300">
                    <thead className="bg-white/5 text-xs uppercase tracking-[0.16em] text-zinc-500">
                      <tr>
                        <th className="px-4 py-3 font-medium">#</th>
                        <th className="px-4 py-3 font-medium">Character</th>
                        <th className="px-4 py-3 font-medium">Class</th>
                        <th className="px-4 py-3 font-medium">Level</th>
                        <th className="px-4 py-3 font-medium">EXP</th>
                        <th className="px-4 py-3 font-medium">Playtime</th>
                        <th className="px-4 py-3 font-medium">Guild</th>
                        <th className="px-4 py-3 font-medium">Last seen</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/8">
                      {rankingOverview.players.map((player) => (
                        <tr key={player.id} className="bg-transparent transition-colors hover:bg-white/[0.03]">
                          <td className="px-4 py-3 align-top text-zinc-500">{player.rank}</td>
                          <td className="px-4 py-3 align-top font-medium text-white">{player.name}</td>
                          <td className="px-4 py-3 align-top">{player.classLabel}</td>
                          <td className="px-4 py-3 align-top">{formatInteger(player.level)}</td>
                          <td className="px-4 py-3 align-top">{formatInteger(player.exp)}</td>
                          <td className="px-4 py-3 align-top">{formatInteger(player.playtime)}</td>
                          <td className="px-4 py-3 align-top">{player.guildName || "—"}</td>
                          <td className="px-4 py-3 align-top">{formatRankingTimestamp(player.lastPlay)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <Alert className="border-white/10 bg-black/20 text-zinc-100">
                <ShieldCheckIcon className="size-4" />
                <AlertTitle>No characters on the board yet</AlertTitle>
                <AlertDescription className="text-zinc-400">
                  The feed is healthy, but there are no visible character entries right now.
                </AlertDescription>
              </Alert>
            )}
          </PublicSection>

          <PublicSection
            eyebrow="Guilds"
            title="Guild ladder"
            description="Guild standings on the live server."
            contentClassName="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.85fr)]"
          >
            {rankingOverview.guilds.length > 0 ? (
              <div className="overflow-hidden rounded-[24px] border border-white/10 bg-black/20">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-white/10 text-left text-sm text-zinc-300">
                    <thead className="bg-white/5 text-xs uppercase tracking-[0.16em] text-zinc-500">
                      <tr>
                        <th className="px-4 py-3 font-medium">#</th>
                        <th className="px-4 py-3 font-medium">Guild</th>
                        <th className="px-4 py-3 font-medium">Ladder</th>
                        <th className="px-4 py-3 font-medium">Level</th>
                        <th className="px-4 py-3 font-medium">Record</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/8">
                      {rankingOverview.guilds.map((guild) => (
                        <tr key={guild.id} className="bg-transparent transition-colors hover:bg-white/[0.03]">
                          <td className="px-4 py-3 align-top text-zinc-500">{guild.rank}</td>
                          <td className="px-4 py-3 align-top font-medium text-white">{guild.name}</td>
                          <td className="px-4 py-3 align-top">{formatInteger(guild.ladderPoint)}</td>
                          <td className="px-4 py-3 align-top">{formatInteger(guild.level)}</td>
                          <td className="px-4 py-3 align-top">{`${formatInteger(guild.win)}-${formatInteger(guild.draw)}-${formatInteger(guild.loss)}`}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <Alert className="border-white/10 bg-black/20 text-zinc-100">
                <ShieldCheckIcon className="size-4" />
                <AlertTitle>No guilds on the board yet</AlertTitle>
                <AlertDescription className="text-zinc-400">
                  The feed is healthy, but there are no visible guild rows right now.
                </AlertDescription>
              </Alert>
            )}

            <Card className="border-white/10 bg-black/20 shadow-none">
              <CardHeader className="space-y-2">
                <CardTitle className="text-xl text-white">What this board shows</CardTitle>
                <CardDescription className="text-sm leading-6 text-zinc-400">
                  Quick read, no filler.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-6 text-zinc-300">
                <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4">
                  Character rank follows level, EXP and playtime.
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4">
                  Guild rank follows ladder points first.
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4">
                  Last seen comes straight from live data.
                </div>
              </CardContent>
            </Card>
          </PublicSection>
        </>
      )}

      <PublicSection eyebrow="Next" title="Ready to climb?" description="Account. Download. First launch.">
        <div className="grid gap-4 md:grid-cols-3">
          {nextRoutes.map((route) => (
            <Card key={route.href} className="border-white/10 bg-black/20 shadow-none">
              <CardHeader className="space-y-3">
                <div className="flex size-10 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-violet-200">
                  {route.icon}
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-lg text-white">{route.title}</CardTitle>
                  <CardDescription className="text-sm leading-6 text-zinc-400">{route.description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  asChild
                  variant="ghost"
                  className="px-0 text-zinc-300 hover:bg-transparent hover:text-white"
                >
                  <Link href={route.href}>
                    {route.label}
                    <ArrowRightIcon className="size-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </PublicSection>
    </SitePageShell>
  );
}
