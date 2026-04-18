import Link from "next/link";
import {
  ArrowRightIcon,
  DownloadIcon,
  ShieldCheckIcon,
  SparklesIcon,
  SwordsIcon,
  TrophyIcon,
  UserRoundPlusIcon,
} from "lucide-react";

import { CmsPageHeader } from "@/components/cms/page-shell";
import { PublicSection } from "@/components/cms/public-section";
import { SitePageShell } from "@/components/cms/site-page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const hubHighlights = [
  {
    title: "One clean way in",
    description: "Download the starter pack, let the launcher patch, then jump into the server without bouncing across old pages.",
    icon: <DownloadIcon className="size-4" />,
  },
  {
    title: "Live competitive loop",
    description: "Rankings already connect the site to actual player and guild activity, so the portal feels alive instead of static.",
    icon: <TrophyIcon className="size-4" />,
  },
  {
    title: "Account + recovery",
    description: "Registration, sign-in and recovery stay in the same player-facing portal when someone needs help getting back in.",
    icon: <ShieldCheckIcon className="size-4" />,
  },
] as const;

const quickRoutes = [
  {
    title: "Play now",
    description: "Go straight to the starter pack and launcher path players actually need.",
    href: "/downloads",
    label: "Open downloads",
    icon: <DownloadIcon className="size-4" />,
  },
  {
    title: "Create your account",
    description: "Get your login ready before the launcher finishes syncing the client.",
    href: "/register",
    label: "Create account",
    icon: <UserRoundPlusIcon className="size-4" />,
  },
  {
    title: "First launch guide",
    description: "Follow the short route from first click to first successful login.",
    href: "/getting-started",
    label: "View getting started",
    icon: <ArrowRightIcon className="size-4" />,
  },
  {
    title: "See who is leading",
    description: "Check the live ladders before you log in or after a long grind session.",
    href: "/rankings",
    label: "View rankings",
    icon: <TrophyIcon className="size-4" />,
  },
] as const;

const portalLoop = [
  {
    title: "Start fast",
    description: "Short copy, obvious CTAs and one clear path from download to first login.",
    icon: <SparklesIcon className="size-4 text-violet-300" />,
  },
  {
    title: "Stay connected",
    description: "Downloads, recovery and rankings live together so the site stays useful after day one.",
    icon: <ShieldCheckIcon className="size-4 text-violet-300" />,
  },
  {
    title: "Keep climbing",
    description: "The portal is built around the real Metin2 loop: enter, compete, recover fast if needed, repeat.",
    icon: <SwordsIcon className="size-4 text-violet-300" />,
  },
] as const;

export default function Home() {
  return (
    <SitePageShell>
      <CmsPageHeader
        eyebrow="Enter the shard"
        title="Patch up. Enter the server. Start climbing."
        description="This is the main game-facing hub: download the launcher, create your account, recover access if needed and jump into the live rankings with the main player routes kept in one clear place."
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
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Live player + guild rankings</div>
      </CmsPageHeader>

      <section className="grid gap-4 md:grid-cols-3">
        {hubHighlights.map((highlight) => (
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
                <CardDescription className="text-sm leading-6 text-zinc-400">{highlight.description}</CardDescription>
              </div>
            </CardHeader>
          </Card>
        ))}
      </section>

      <PublicSection
        eyebrow="Start here"
        title="The routes players actually use"
        description="Everything important is one click away: no documentation maze, no dead-end splash pages."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {quickRoutes.map((route) => (
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

      <PublicSection
        eyebrow="Server loop"
        title="Built around the real Metin2 routine"
        description="Get people in fast, keep trust high, and make the site feel connected to the server every day."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {portalLoop.map((item) => (
            <div key={item.title} className="rounded-[28px] border border-white/10 bg-black/20 px-5 py-5">
              <div className="flex items-center gap-2 text-white">
                {item.icon}
                <span className="font-medium">{item.title}</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-zinc-400">{item.description}</p>
            </div>
          ))}
        </div>
      </PublicSection>
    </SitePageShell>
  );
}
