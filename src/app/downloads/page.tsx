import Link from "next/link";
import {
  ArrowRightIcon,
  DownloadIcon,
  TrophyIcon,
  UserRoundPlusIcon,
} from "lucide-react";

import { CmsPageHeader } from "@/components/cms/page-shell";
import { SitePageShell } from "@/components/cms/site-page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getPublicEnv } from "@/lib/env";

const nextRoutes = [
  {
    title: "Create account",
    description: "Set up your login first.",
    href: "/register",
    label: "Create account",
    icon: <UserRoundPlusIcon className="size-4" />,
  },
  {
    title: "First launch guide",
    description: "Shortest path to first login.",
    href: "/getting-started",
    label: "Open getting started",
    icon: <ArrowRightIcon className="size-4" />,
  },
  {
    title: "Live rankings",
    description: "Check players and guilds.",
    href: "/rankings",
    label: "View rankings",
    icon: <TrophyIcon className="size-4" />,
  },
] as const;

export default function DownloadsPage() {
  const publicEnv = getPublicEnv();
  const starterPackUrl = publicEnv.STARTER_PACK_URL;
  const hasStarterPackDownload = Boolean(starterPackUrl);

  return (
    <SitePageShell>
      <CmsPageHeader
        eyebrow="Downloads"
        title="One download between you and the server."
        description="Download the launcher, patch, enter."
      >
        <div data-slot="downloads-primary-actions" className="flex w-full flex-col gap-3 pt-2 sm:flex-row">
          {hasStarterPackDownload ? (
            <Button
              asChild
              size="lg"
              className="h-12 justify-between rounded-2xl bg-violet-500 px-5 text-base text-white shadow-lg shadow-violet-950/40 hover:bg-violet-400 sm:min-w-[240px]"
            >
              <Link href="/downloads/client">
                Download launcher
                <DownloadIcon className="size-4" />
              </Link>
            </Button>
          ) : (
            <Button
              asChild
              size="lg"
              className="h-12 justify-between rounded-2xl bg-violet-500 px-5 text-base text-white shadow-lg shadow-violet-950/40 hover:bg-violet-400 sm:min-w-[240px]"
            >
              <Link href="/getting-started">
                View install flow
                <ArrowRightIcon className="size-4" />
              </Link>
            </Button>
          )}
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-12 justify-between rounded-2xl border-white/10 bg-white/5 px-5 text-base text-zinc-100 hover:bg-white/10 sm:min-w-[220px]"
          >
            <Link href={hasStarterPackDownload ? "/downloads/client/checksum" : "/getting-started"}>
              {hasStarterPackDownload ? "Verify SHA256" : "Open getting started"}
              <ArrowRightIcon className="size-4" />
            </Link>
          </Button>
        </div>

        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Official Windows support</div>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Linux via Wine</div>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Base client included</div>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Resume-friendly download</div>
      </CmsPageHeader>

      <Card className="border-white/10 bg-black/20 shadow-none">
        <CardContent className="space-y-3 px-4 py-4">
          <p className="text-sm leading-6 text-zinc-400">
            If you are not done after the download, these are the other pages players usually open next.
          </p>

          {nextRoutes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              data-slot="next-route"
              className="group flex items-center gap-4 rounded-[24px] border border-white/10 bg-white/5 px-4 py-4 text-left transition duration-200 hover:border-white/20 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-violet-200 transition-colors group-hover:border-violet-300/30 group-hover:bg-violet-500/20 group-hover:text-violet-100">
                {route.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-medium text-white">{route.title}</span>
                <span className="block text-sm leading-6 text-zinc-400 group-hover:text-zinc-300">
                  {route.description}
                </span>
              </span>
              <ArrowRightIcon className="size-4 shrink-0 text-zinc-500 transition-transform group-hover:translate-x-1 group-hover:text-white" />
            </Link>
          ))}
        </CardContent>
      </Card>
    </SitePageShell>
  );
}
