import Link from "next/link";
import { AlertTriangleIcon, ArrowRightIcon, DownloadIcon, ShieldCheckIcon, UserRoundPlusIcon } from "lucide-react";

import { PublicSection } from "@/components/cms/public-section";
import { SitePageShell } from "@/components/cms/site-page-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
    title: "Download launcher",
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

          <PublicSection eyebrow="Guilds" title="Guild ladder" description="Guild standings on the live server.">
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
          </PublicSection>
        </>
      )}

      <PublicSection eyebrow="Next" title="Ready to climb?" description="Account. Download. First launch.">
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
