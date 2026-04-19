import Link from "next/link";
import {
  ArrowRightIcon,
  CheckCircle2Icon,
  DownloadIcon,
  HardDriveDownloadIcon,
  MonitorIcon,
  ShieldCheckIcon,
  TrophyIcon,
  UserRoundPlusIcon,
} from "lucide-react";

import { CmsPageHeader } from "@/components/cms/page-shell";
import { SitePageShell } from "@/components/cms/site-page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getPublicEnv } from "@/lib/env";

const starterPackBenefits = [
  {
    title: "Base client included",
    description: "Launcher and base client in one download.",
    icon: <DownloadIcon className="size-4" />,
  },
  {
    title: "Windows first",
    description: "Official Windows support from the first click.",
    icon: <MonitorIcon className="size-4" />,
  },
  {
    title: "Resume-friendly",
    description: "Resume works if the connection drops.",
    icon: <HardDriveDownloadIcon className="size-4" />,
  },
] as const;

const quickNotes = [
  "Launcher auto-updates after install.",
  "Linux works through Wine.",
  "SHA256 is there if you want it.",
] as const;

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
  const starterPackChecksum = publicEnv.STARTER_PACK_SHA256;
  const hasStarterPackDownload = Boolean(starterPackUrl);

  return (
    <SitePageShell>
      <CmsPageHeader
        eyebrow="Downloads"
        title="One download between you and the server."
        description="Download the launcher, patch, enter."
        actions={
          <>
            {hasStarterPackDownload ? (
              <Button asChild className="bg-violet-500 text-white shadow-lg shadow-violet-950/40 hover:bg-violet-400">
                <Link href="/downloads/client">
                  Download launcher
                  <DownloadIcon className="size-4" />
                </Link>
              </Button>
            ) : (
              <Button asChild className="bg-violet-500 text-white shadow-lg shadow-violet-950/40 hover:bg-violet-400">
                <Link href="/getting-started">
                  View install flow
                  <ArrowRightIcon className="size-4" />
                </Link>
              </Button>
            )}
            <Button
              asChild
              variant="outline"
              className="border-white/10 bg-white/5 text-zinc-100 hover:bg-white/10"
            >
              <Link href={hasStarterPackDownload ? "/downloads/client/checksum" : "/getting-started"}>
                {hasStarterPackDownload ? "Verify SHA256" : "Open getting started"}
              </Link>
            </Button>
          </>
        }
      >
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Official Windows support</div>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Linux via Wine</div>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Base client included</div>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Resume-friendly download</div>
      </CmsPageHeader>

      <section className="grid gap-4 xl:items-start xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <Card className="border-white/10 bg-black/20 shadow-none">
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl text-white">
              {hasStarterPackDownload ? "Launcher download" : "The client will appear here"}
            </CardTitle>
            <CardDescription className="text-sm leading-6 text-zinc-400">
              {hasStarterPackDownload
                ? "Launcher package, base client and checksum in one place."
                : "As soon as the pack is configured, the button goes live here."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-6 text-zinc-300">
            <div className="grid gap-3 md:grid-cols-3">
              {starterPackBenefits.map((benefit) => (
                <div key={benefit.title} className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4">
                  <div className="flex items-center gap-2 text-white">
                    <span className="flex size-8 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-violet-200">
                      {benefit.icon}
                    </span>
                    <span className="font-medium">{benefit.title}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">{benefit.description}</p>
                </div>
              ))}
            </div>

            {hasStarterPackDownload ? (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  <Button asChild className="bg-violet-500 text-white shadow-lg shadow-violet-950/40 hover:bg-violet-400">
                    <Link href="/downloads/client">
                      Download launcher
                      <DownloadIcon className="size-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="border-white/10 bg-white/5 text-zinc-100 hover:bg-white/10"
                  >
                    <Link href="/downloads/client/checksum">Download checksum file</Link>
                  </Button>
                </div>

                <div className="rounded-[24px] border border-white/10 bg-[#07080d] px-4 py-4">
                  <p className="text-[0.72rem] uppercase tracking-[0.16em] text-zinc-500">SHA256 checksum</p>
                  <p className="mt-3 break-all font-mono text-sm text-zinc-200">
                    {starterPackChecksum || "Use the checksum button above if you want to verify the package manually before launch."}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-zinc-500">
                    Optional, but useful if you want one extra trust check before opening the launcher.
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 px-4 py-4 text-zinc-400">
                The launcher package is not published yet. Once it is configured, this same page will expose the live download and checksum actions automatically.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-black/20 shadow-none">
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl text-white">Quick launch</CardTitle>
            <CardDescription className="text-sm leading-6 text-zinc-400">
              What players need before first login.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-6 text-zinc-300">
            {hasStarterPackDownload ? (
              <>
                {quickNotes.map((note) => (
                  <div key={note} className="flex items-start gap-3 rounded-3xl border border-white/10 bg-white/5 px-4 py-4">
                    <CheckCircle2Icon className="mt-1 size-4 shrink-0 text-violet-300" />
                    <p>{note}</p>
                  </div>
                ))}

                <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4">
                  <div className="flex items-center gap-2 text-white">
                    <ShieldCheckIcon className="size-4 text-violet-300" />
                    <span className="font-medium">Good fit for first launch</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    Download once, let the launcher catch up to the live version, then use the same portal for account access and rankings.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start gap-3 rounded-3xl border border-white/10 bg-white/5 px-4 py-4">
                  <CheckCircle2Icon className="mt-1 size-4 shrink-0 text-violet-300" />
                  <p>The install flow page is already ready, even if the file is not published yet.</p>
                </div>
                <div className="flex items-start gap-3 rounded-3xl border border-white/10 bg-white/5 px-4 py-4">
                  <CheckCircle2Icon className="mt-1 size-4 shrink-0 text-violet-300" />
                  <p>Once the package goes live, this page will expose the real download and checksum actions automatically.</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4">
                  <div className="flex items-center gap-2 text-white">
                    <ShieldCheckIcon className="size-4 text-violet-300" />
                    <span className="font-medium">Need a route right now?</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    Use the getting-started flow while the package is being prepared for publication.
                  </p>
                </div>
              </>
            )}

            <Button
              asChild
              variant="outline"
              className="w-full border-white/10 bg-white/5 text-zinc-100 hover:bg-white/10"
            >
              <Link href="/getting-started">
                Open getting started
                <ArrowRightIcon className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

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
