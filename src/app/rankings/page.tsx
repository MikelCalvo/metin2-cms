import Link from "next/link";
import { ArrowRightIcon, BarChart3Icon, CrownIcon, ShieldCheckIcon, SwordsIcon, TrophyIcon } from "lucide-react";

import { CmsPageHeader } from "@/components/cms/page-shell";
import { PublicSection } from "@/components/cms/public-section";
import { SitePageShell } from "@/components/cms/site-page-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const rankingModules = [
  {
    title: "Top player ladder",
    description: "The first likely read model: a clear player ranking table with the fields that matter most to the server community.",
    icon: <TrophyIcon className="size-4" />,
  },
  {
    title: "Guild and faction views",
    description: "Once the live schema is audited, rankings can expand into guild or empire perspectives without changing the site shell.",
    icon: <CrownIcon className="size-4" />,
  },
  {
    title: "Read-only data services",
    description: "Query logic should live in dedicated server services so the UI layer only consumes shaped ranking data.",
    icon: <BarChart3Icon className="size-4" />,
  },
] as const;

const plannedReadModels = [
  "top characters by the first agreed progression metric",
  "top guilds if the live schema supports it cleanly",
  "server or empire filters only after the real columns are confirmed",
  "later profile-style drill-down pages for characters or guilds",
] as const;

export default function RankingsPage() {
  return (
    <SitePageShell>
      <CmsPageHeader
        eyebrow="Rankings"
        title="Private read-only game-data shell"
        description="This route is deliberately landing before the item shop. Rankings are the safest next expansion after private site navigation and onboarding because they add daily value without introducing purchase-side state."
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
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Read-only first</div>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Live schema inspection next</div>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Shop comes after data shells</div>
      </CmsPageHeader>

      <section className="grid gap-4 xl:grid-cols-3">
        {rankingModules.map((module) => (
          <Card key={module.title} className="border-white/10 bg-white/[0.04] shadow-2xl shadow-black/20 backdrop-blur-xl">
            <CardHeader className="space-y-3">
              <div className="flex size-10 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-violet-200">
                {module.icon}
              </div>
              <div className="space-y-2">
                <CardTitle className="text-xl text-white">{module.title}</CardTitle>
                <CardDescription className="text-sm leading-6 text-zinc-400">{module.description}</CardDescription>
              </div>
            </CardHeader>
          </Card>
        ))}
      </section>

      <PublicSection
        eyebrow="Current status"
        title="UI shell now, live ladders next"
        description="The route is intentionally present before the actual ranking queries are wired, so the site navigation and product structure are already settled when the read models arrive."
        contentClassName="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]"
      >
        <Alert className="border-white/10 bg-black/20 text-zinc-100">
          <ShieldCheckIcon className="size-4" />
          <AlertTitle>Why rankings before the shop?</AlertTitle>
          <AlertDescription className="text-zinc-400">
            Rankings are valuable and visible, but they do not require the same fulfillment, auditing and balance-side guarantees as commerce. That makes them the safest next bridge between the private CMS and live game data.
          </AlertDescription>
        </Alert>

        <Card className="border-white/10 bg-black/20 shadow-none">
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl text-white">Planned read models</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {plannedReadModels.map((item) => (
              <div key={item} className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-zinc-300">
                {item}
              </div>
            ))}
          </CardContent>
        </Card>
      </PublicSection>

      <PublicSection
        eyebrow="Next handoff"
        title="This shell is the bridge into real game-data views"
        description="After the live ranking queries are inspected and modeled, this page can render actual tables, filters and later character or guild drill-down links."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-black/20 px-4 py-4">
            <div className="flex items-center gap-2 text-white">
              <SwordsIcon className="size-4 text-violet-300" />
              <span className="font-medium">Player ladders</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-zinc-400">The first version can stay intentionally simple: top players with a clear headline metric and a clean table layout.</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-black/20 px-4 py-4">
            <div className="flex items-center gap-2 text-white">
              <CrownIcon className="size-4 text-violet-300" />
              <span className="font-medium">Guild views</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-zinc-400">If the live schema allows it, guild ladders can follow without changing the site route structure.</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-black/20 px-4 py-4">
            <div className="flex items-center gap-2 text-white">
              <BarChart3Icon className="size-4 text-violet-300" />
              <span className="font-medium">Read services</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-zinc-400">Dedicated ranking repositories and services should shape the data before it ever reaches the page component.</p>
          </div>
        </div>
      </PublicSection>
    </SitePageShell>
  );
}
