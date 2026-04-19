import Link from "next/link";
import { ArrowRightIcon, DownloadIcon, TrophyIcon, UserRoundPlusIcon } from "lucide-react";

import { CmsPageHeader } from "@/components/cms/page-shell";
import { PublicSection } from "@/components/cms/public-section";
import { SitePageShell } from "@/components/cms/site-page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const quickRoutes = [
  {
    title: "Play now",
    description: "Launcher + base client.",
    href: "/downloads",
    label: "Open downloads",
    icon: <DownloadIcon className="size-4" />,
  },
  {
    title: "Create account",
    description: "Get your login ready first.",
    href: "/register",
    label: "Create account",
    icon: <UserRoundPlusIcon className="size-4" />,
  },
  {
    title: "Rankings",
    description: "Check players and guilds.",
    href: "/rankings",
    label: "View rankings",
    icon: <TrophyIcon className="size-4" />,
  },
] as const;

export default function Home() {
  return (
    <SitePageShell>
      <CmsPageHeader
        title={
          <>
            <span className="block">Enter the server.</span>
            <span className="block">Start climbing.</span>
          </>
        }
        description="Download the launcher, create your account and jump into the ladder from one clear server hub."
      >
        <div className="flex w-full flex-col gap-3 pt-2 sm:flex-row">
          <Link
            href="/downloads"
            className="group inline-flex items-center justify-between gap-4 rounded-2xl border border-white/12 bg-white/[0.08] px-4 py-3 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/[0.12]"
          >
            <span className="flex items-center gap-3">
              <DownloadIcon className="size-4 text-zinc-200" />
              Download launcher
            </span>
            <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>

          <Link
            href="/register"
            className="group inline-flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-medium text-zinc-100 transition hover:border-white/20 hover:bg-white/[0.06]"
          >
            <span className="flex items-center gap-3">
              <UserRoundPlusIcon className="size-4 text-zinc-300" />
              Create account
            </span>
            <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Official Windows support</div>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Linux via Wine</div>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Auto-updating launcher</div>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Live player + guild rankings</div>
      </CmsPageHeader>

      <PublicSection eyebrow="Start here" title="The routes that matter" description="Three routes. No filler.">
        <div className="grid gap-4 md:grid-cols-3">
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
    </SitePageShell>
  );
}
