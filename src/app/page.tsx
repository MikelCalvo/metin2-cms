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

const playerExpectations = [
  {
    title: "Official Windows support",
    description: "The default player path is built around Windows with the starter pack and launcher ready from day one.",
    icon: <HardDriveDownloadIcon className="size-4" />,
  },
  {
    title: "Linux via Wine",
    description: "The same package is positioned to work for Linux players through Wine, without splitting the download experience.",
    icon: <SparklesIcon className="size-4" />,
  },
  {
    title: "Launcher + auto patching",
    description: "Players download once, then let the launcher keep the game updated before each session.",
    icon: <DownloadIcon className="size-4" />,
  },
  {
    title: "Secure account hub",
    description: "Recovery, session control and account updates live in the same portal players already use to sign in.",
    icon: <ShieldCheckIcon className="size-4" />,
  },
] as const;

const entryRoutes = [
  {
    title: "Download the starter pack",
    description: "One starter pack includes the launcher, the game files and the update path players expect from a live server.",
    href: "/downloads",
    icon: <DownloadIcon className="size-4" />,
    label: "Open downloads",
  },
  {
    title: "Create the account",
    description: "Registration and recovery are already part of the same flow, so new players are not pushed into legacy PHP surfaces.",
    href: "/register",
    icon: <ShieldCheckIcon className="size-4" />,
    label: "Create account",
  },
  {
    title: "Start playing",
    description: "The onboarding route explains the shortest path from launcher install to the first successful login.",
    href: "/getting-started",
    icon: <ArrowRightIcon className="size-4" />,
    label: "View first-login guide",
  },
  {
    title: "Check the live ladders",
    description: "Rankings already connect to live player and guild data, giving the portal a real gameplay surface out of the box.",
    href: "/rankings",
    icon: <TrophyIcon className="size-4" />,
    label: "View rankings",
  },
] as const;

export default function Home() {
  return (
    <SitePageShell>
      <CmsPageHeader
        eyebrow="Enter the shard"
        title="Download once. Patch automatically. Join the next Metin2 war."
        description="This landing is shaped like a real server portal from the first load: official Windows support, Linux via Wine, one starter pack with an auto-updating launcher, secure account access and live rankings in the same place."
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

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {playerExpectations.map((expectation) => (
          <Card
            key={expectation.title}
            className="border-white/10 bg-white/[0.04] shadow-2xl shadow-black/20 backdrop-blur-xl"
          >
            <CardHeader className="space-y-3">
              <div className="flex size-10 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-violet-200">
                {expectation.icon}
              </div>
              <div className="space-y-2">
                <CardTitle className="text-xl text-white">{expectation.title}</CardTitle>
                <CardDescription className="text-sm leading-6 text-zinc-400">
                  {expectation.description}
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        ))}
      </section>

      <PublicSection
        eyebrow="Player journey"
        title="Everything players expect on day one"
        description="The landing, download flow, onboarding and rankings are already framed like a live server site instead of a documentation hub."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {entryRoutes.map((route) => (
            <Card key={route.href} className="border-white/10 bg-black/20 shadow-none">
              <CardHeader className="space-y-3">
                <div className="flex size-10 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-violet-200">
                  {route.icon}
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-lg text-white">{route.title}</CardTitle>
                  <CardDescription className="text-sm leading-6 text-zinc-400">
                    {route.description}
                  </CardDescription>
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
        eyebrow="Ready to enter"
        title="Starter pack, player account and live ladders in one loop"
        description="Short path, clear CTAs and enough structure to fork and rebrand fast without turning the homepage back into documentation."
        action={
          <div className="flex flex-wrap gap-3">
            <Button asChild className="bg-violet-500 text-white shadow-lg shadow-violet-950/40 hover:bg-violet-400">
              <Link href="/downloads">
                Open downloads
                <DownloadIcon className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-white/10 bg-white/5 text-zinc-100 hover:bg-white/10"
            >
              <Link href="/rankings">View rankings</Link>
            </Button>
          </div>
        }
      >
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-black/20 px-4 py-4">
            <div className="flex items-center gap-2 text-white">
              <DownloadIcon className="size-4 text-violet-300" />
              <span className="font-medium">Starter pack</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-zinc-400">The launcher and the game arrive together in the same download surface.</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-black/20 px-4 py-4">
            <div className="flex items-center gap-2 text-white">
              <ShieldCheckIcon className="size-4 text-violet-300" />
              <span className="font-medium">Player account</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-zinc-400">Registration, recovery and session control already fit the premium dark UI.</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-black/20 px-4 py-4">
            <div className="flex items-center gap-2 text-white">
              <SwordsIcon className="size-4 text-violet-300" />
              <span className="font-medium">Competitive loop</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-zinc-400">Live rankings complete the player-facing loop and make the site feel game-connected.</p>
          </div>
        </div>
      </PublicSection>
    </SitePageShell>
  );
}
