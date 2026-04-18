import Link from "next/link";
import {
  ArrowRightIcon,
  DownloadIcon,
  HardDriveDownloadIcon,
  ShieldCheckIcon,
  SparklesIcon,
  SwordsIcon,
  TrophyIcon,
} from "lucide-react";

import { CmsPageHeader } from "@/components/cms/page-shell";
import { PublicSection } from "@/components/cms/public-section";
import { SitePageShell } from "@/components/cms/site-page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const homeHighlights = [
  {
    title: "Launcher-ready install",
    description: "Download once, open the launcher and let it handle the first patch before you log in.",
    icon: <DownloadIcon className="size-4" />,
  },
  {
    title: "Official Windows support",
    description: "Windows is the main path from the first click, with the starter pack and launcher already lined up.",
    icon: <HardDriveDownloadIcon className="size-4" />,
  },
  {
    title: "Linux via Wine",
    description: "Linux players stay on the same route instead of hunting for a separate community package.",
    icon: <SparklesIcon className="size-4" />,
  },
] as const;

const quickActions = [
  {
    title: "Download",
    description: "Grab the starter pack and get the launcher in the same download.",
    href: "/downloads",
    label: "Open downloads",
    icon: <DownloadIcon className="size-4" />,
  },
  {
    title: "Create account",
    description: "Register now so your first login is ready when the launcher finishes.",
    href: "/register",
    label: "Create account",
    icon: <ShieldCheckIcon className="size-4" />,
  },
  {
    title: "First launch",
    description: "See the shortest path from install to entering the server.",
    href: "/getting-started",
    label: "View first-login guide",
    icon: <ArrowRightIcon className="size-4" />,
  },
  {
    title: "Live rankings",
    description: "Check the ladders before you jump in or after the grind session ends.",
    href: "/rankings",
    label: "View rankings",
    icon: <TrophyIcon className="size-4" />,
  },
] as const;

const homeLoop = [
  {
    title: "Download and patch",
    description: "One launcher-first entrypoint instead of scattered mirrors and old-school hand-holding.",
    icon: <DownloadIcon className="size-4 text-violet-300" />,
  },
  {
    title: "Secure account hub",
    description: "Register, recover and manage your access from the same player-facing portal.",
    icon: <ShieldCheckIcon className="size-4 text-violet-300" />,
  },
  {
    title: "Competitive loop",
    description: "Live ladders keep the site connected to the actual server instead of feeling like a dead landing page.",
    icon: <SwordsIcon className="size-4 text-violet-300" />,
  },
] as const;

export default function Home() {
  return (
    <SitePageShell>
      <CmsPageHeader
        eyebrow="Enter the shard"
        title="Patch, login and get into the fight."
        description="This home is the game-facing front door: one starter pack with an auto-updating launcher, official Windows support, Linux via Wine and the key player routes right where people expect them."
        actions={
          <>
            <Button asChild className="bg-violet-500 text-white shadow-lg shadow-violet-950/40 hover:bg-violet-400">
              <Link href="/downloads">
                Download starter pack
                <DownloadIcon className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-white/10 bg-white/5 text-zinc-100 hover:bg-white/10"
            >
              <Link href="/register">Create account</Link>
            </Button>
          </>
        }
      >
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Official Windows support</div>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Linux via Wine</div>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Auto-updating launcher</div>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Live player rankings</div>
      </CmsPageHeader>

      <section className="grid gap-4 md:grid-cols-3">
        {homeHighlights.map((highlight) => (
          <Card
            key={highlight.title}
            className="border-white/10 bg-white/[0.04] shadow-2xl shadow-black/20 backdrop-blur-xl"
          >
            <CardHeader className="space-y-3">
              <div className="flex size-10 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-violet-200">
                {highlight.icon}
              </div>
              <div className="space-y-2">
                <CardTitle className="text-xl text-white">{highlight.title}</CardTitle>
                <CardDescription className="text-sm leading-6 text-zinc-400">
                  {highlight.description}
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        ))}
      </section>

      <PublicSection
        eyebrow="Start here"
        title="Everything important before the first session"
        description="Less reading, less scrolling, more obvious next steps."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((action) => (
            <Card key={action.href} className="border-white/10 bg-black/20 shadow-none">
              <CardHeader className="space-y-3">
                <div className="flex size-10 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-violet-200">
                  {action.icon}
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-lg text-white">{action.title}</CardTitle>
                  <CardDescription className="text-sm leading-6 text-zinc-400">
                    {action.description}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  asChild
                  variant="ghost"
                  className="px-0 text-zinc-300 hover:bg-transparent hover:text-white"
                >
                  <Link href={action.href}>
                    {action.label}
                    <ArrowRightIcon className="size-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </PublicSection>

      <section className="grid gap-4 md:grid-cols-3">
        {homeLoop.map((item) => (
          <div key={item.title} className="rounded-[28px] border border-white/10 bg-black/20 px-5 py-5">
            <div className="flex items-center gap-2 text-white">
              {item.icon}
              <span className="font-medium">{item.title}</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-zinc-400">{item.description}</p>
          </div>
        ))}
      </section>
    </SitePageShell>
  );
}
