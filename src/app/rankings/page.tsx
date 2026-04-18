import Link from "next/link";
import {
  AlertTriangleIcon,
  ArrowRightIcon,
  BarChart3Icon,
  CrownIcon,
  ShieldCheckIcon,
  SwordsIcon,
  TrophyIcon,
} from "lucide-react";

import { CmsPageHeader } from "@/components/cms/page-shell";
import { PublicSection } from "@/components/cms/public-section";
import { SitePageShell } from "@/components/cms/site-page-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRankingTimestamp } from "@/server/rankings/rankings-formatters";
import { getRankingOverview } from "@/server/rankings/rankings-service";

export const dynamic = "force-dynamic";

const integerFormatter = new Intl.NumberFormat("en-US");

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
      <CmsPageHeader
        eyebrow="Rankings"
        title="Private read-only game-data leaderboard"
        description="The rankings route is now wired to the live player database through a dedicated read-only path. It is the first real bridge between the private web shell and gameplay data without introducing commerce-side state."
        actions={
          <>
            <Button asChild className="bg-violet-500 text-white shadow-lg shadow-violet-950/40 hover:bg-violet-400">
              <Link href="/game">
                Back to game overview
                <ArrowRightIcon className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-white/10 bg-white/5 text-zinc-100 hover:bg-white/10"
            >
              <Link href="/account">Open account</Link>
            </Button>
          </>
        }
      >
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Read-only ranking queries</div>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Player + guild ladders</div>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Item shop stays next</div>
      </CmsPageHeader>

      <section className="grid gap-4 xl:grid-cols-3">
        <Card className="border-white/10 bg-white/[0.04] shadow-2xl shadow-black/20 backdrop-blur-xl">
          <CardHeader className="space-y-3">
            <div className="flex size-10 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-violet-200">
              <TrophyIcon className="size-4" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-xl text-white">Top characters</CardTitle>
              <CardDescription className="text-sm leading-6 text-zinc-400">
                Ordered by level, then experience, then playtime so the ladder stays deterministic and easy to read.
              </CardDescription>
            </div>
          </CardHeader>
        </Card>

        <Card className="border-white/10 bg-white/[0.04] shadow-2xl shadow-black/20 backdrop-blur-xl">
          <CardHeader className="space-y-3">
            <div className="flex size-10 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-violet-200">
              <CrownIcon className="size-4" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-xl text-white">Top guilds</CardTitle>
              <CardDescription className="text-sm leading-6 text-zinc-400">
                Ladder points lead the guild ranking, with level and experience as stable tie-breakers.
              </CardDescription>
            </div>
          </CardHeader>
        </Card>

        <Card className="border-white/10 bg-white/[0.04] shadow-2xl shadow-black/20 backdrop-blur-xl">
          <CardHeader className="space-y-3">
            <div className="flex size-10 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-violet-200">
              <BarChart3Icon className="size-4" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-xl text-white">Safe read path</CardTitle>
              <CardDescription className="text-sm leading-6 text-zinc-400">
                The CMS uses a dedicated ranking database connection for these ladders so gameplay reads stay isolated from auth and commerce flows.
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
      </section>

      {rankingOverview.status === "unavailable" ? (
        <PublicSection
          eyebrow="Availability"
          title="Ranking data is not available yet"
          description="The page shell is ready, but the live ranking feed cannot be queried right now."
        >
          <Alert className="border-white/10 bg-black/20 text-zinc-100">
            <AlertTriangleIcon className="size-4" />
            <AlertTitle>Ranking feed unavailable</AlertTitle>
            <AlertDescription className="text-zinc-400">{rankingOverview.message}</AlertDescription>
          </Alert>
        </PublicSection>
      ) : (
        <>
          <PublicSection
            eyebrow="Live ladder"
            title="Live character ladder"
            description="The first board now reads straight from the live character data and joins guild names when a character belongs to one."
          >
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
                        <th className="px-4 py-3 font-medium">Experience</th>
                        <th className="px-4 py-3 font-medium">Playtime</th>
                        <th className="px-4 py-3 font-medium">Guild</th>
                        <th className="px-4 py-3 font-medium">Last active</th>
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
                <AlertTitle>No characters to rank yet</AlertTitle>
                <AlertDescription className="text-zinc-400">
                  The ranking query is healthy, but the live character table does not currently return any visible entries.
                </AlertDescription>
              </Alert>
            )}
          </PublicSection>

          <PublicSection
            eyebrow="Guild ladder"
            title="Live guild standings"
            description="Guild ladder points are surfaced alongside level, experience and war results so the web starts exposing more than a single player-only board."
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
                <AlertTitle>No guild standings yet</AlertTitle>
                <AlertDescription className="text-zinc-400">
                  The guild ladder is wired up, but the live guild table does not currently expose visible rows.
                </AlertDescription>
              </Alert>
            )}

            <Card className="border-white/10 bg-black/20 shadow-none">
              <CardHeader className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="border border-white/10 bg-white/5 text-zinc-300">
                    Investigation result
                  </Badge>
                  <Badge variant="secondary" className="border border-violet-400/20 bg-violet-500/10 text-violet-200">
                    Implemented
                  </Badge>
                </div>
                <CardTitle className="text-xl text-white">What the live schema gives us already</CardTitle>
                <CardDescription className="text-sm leading-6 text-zinc-400">
                  The first ranking slice is based on live rows from `player.player`, `player.guild_member` and `player.guild`.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-6 text-zinc-300">
                <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4">
                  Character ranking uses level, experience and playtime for deterministic ordering.
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4">
                  Guild ranking uses ladder points first, then level and experience.
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4">
                  The next step can be class or empire filters, or character and guild detail pages.
                </div>
              </CardContent>
            </Card>
          </PublicSection>
        </>
      )}

      <PublicSection
        eyebrow="Next up"
        title="This now unlocks the item shop foundation cleanly"
        description="With auth, onboarding and live rankings in place, the next risky step becomes commerce: catalog, pricing and audited order flows."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-black/20 px-4 py-4">
            <div className="flex items-center gap-2 text-white">
              <SwordsIcon className="size-4 text-violet-300" />
              <span className="font-medium">Read models done</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-zinc-400">The site now has a real gameplay-facing route backed by live data instead of only marketing or account UI.</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-black/20 px-4 py-4">
            <div className="flex items-center gap-2 text-white">
              <BarChart3Icon className="size-4 text-violet-300" />
              <span className="font-medium">Clear boundary</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-zinc-400">Rankings stay read-only, which keeps this slice safer than jumping straight into purchase-side logic.</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-black/20 px-4 py-4">
            <div className="flex items-center gap-2 text-white">
              <TrophyIcon className="size-4 text-violet-300" />
              <span className="font-medium">Next roadmap handoff</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-zinc-400">From here we can wire the item shop foundation without building it on a fake or empty public shell.</p>
          </div>
        </div>
      </PublicSection>
    </SitePageShell>
  );
}
