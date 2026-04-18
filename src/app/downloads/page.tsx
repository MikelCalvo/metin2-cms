import Link from "next/link";
import {
  ArrowRightIcon,
  CheckCircle2Icon,
  DownloadIcon,
  HardDriveDownloadIcon,
  MonitorIcon,
  SparklesIcon,
} from "lucide-react";

import { CmsPageHeader } from "@/components/cms/page-shell";
import { PublicSection } from "@/components/cms/public-section";
import { SitePageShell } from "@/components/cms/site-page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getPublicEnv } from "@/lib/env";

const packageHighlights = [
  {
    title: "Launcher included",
    description: "The starter pack already includes the launcher and the base client in one clear download.",
    icon: <DownloadIcon className="size-4" />,
  },
  {
    title: "Official Windows support",
    description: "Windows is the main path and the easiest way to get from download to first login.",
    icon: <MonitorIcon className="size-4" />,
  },
  {
    title: "Linux via Wine",
    description: "Linux players can stay on the same package instead of looking for a split build.",
    icon: <SparklesIcon className="size-4" />,
  },
] as const;

const installSteps = [
  {
    title: "Download the starter pack",
    description: "Use the main button below and save the package locally.",
  },
  {
    title: "Open the launcher",
    description: "Run it once and let it pull the latest game files before logging in.",
  },
  {
    title: "Sign in and play",
    description: "Use the same account from the portal and enter the server.",
  },
] as const;

const quickNotes = [
  "You can resume the download if your connection drops.",
  "The launcher auto-updates the game after install.",
  "SHA256 is available if you want to verify the file manually.",
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
        title="Download, install and play."
        description="One starter pack, one launcher and one clean route into the server. Official Windows support is the main path, Linux via Wine stays supported, and a launcher that auto-updates the game after install keeps the client current."
        actions={
          <>
            {hasStarterPackDownload ? (
              <Button asChild className="bg-violet-500 text-white shadow-lg shadow-violet-950/40 hover:bg-violet-400">
                <Link href="/downloads/client">
                  Download starter pack
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
                {hasStarterPackDownload ? "SHA256 checksum" : "Open getting started"}
              </Link>
            </Button>
          </>
        }
      >
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Official Windows support</div>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Linux via Wine</div>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Launcher included</div>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Resume-friendly download</div>
      </CmsPageHeader>

      <PublicSection
        eyebrow="Ready to install?"
        title={hasStarterPackDownload ? "Everything you need for the first launch" : "The download will appear here"}
        description={
          hasStarterPackDownload
            ? "Simple and player-facing: download the pack, open the launcher, let it update and get in-game."
            : "The layout is ready. As soon as the starter pack is configured, the main download button will go live here."
        }
        contentClassName="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.9fr)]"
      >
        <Card className="border-white/10 bg-black/20 shadow-none">
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl text-white">Starter pack</CardTitle>
            <CardDescription className="text-sm leading-6 text-zinc-400">
              No mirror maze, no split packages, no GitHub-style release wall. Just the download most players want.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-6 text-zinc-300">
            <div className="grid gap-3 md:grid-cols-3">
              {packageHighlights.map((highlight) => (
                <div key={highlight.title} className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4">
                  <div className="flex items-center gap-2 text-white">
                    <span className="flex size-8 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-violet-200">
                      {highlight.icon}
                    </span>
                    <span className="font-medium">{highlight.title}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">{highlight.description}</p>
                </div>
              ))}
            </div>

            {hasStarterPackDownload ? (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  <Button asChild className="bg-violet-500 text-white shadow-lg shadow-violet-950/40 hover:bg-violet-400">
                    <Link href="/downloads/client">
                      Download starter pack
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
                    {starterPackChecksum || "If you like to verify downloads manually, use the checksum file button above."}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-zinc-500">
                    Optional, but useful if you want extra peace of mind before the first launch.
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 px-4 py-4 text-zinc-400">
                The starter pack is not published yet. Once it is configured, this same page will expose the live download and checksum actions automatically.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-black/20 shadow-none">
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl text-white">Quick install</CardTitle>
            <CardDescription className="text-sm leading-6 text-zinc-400">
              The short version players actually need before the first session.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-6 text-zinc-300">
            {installSteps.map((step, index) => (
              <div key={step.title} className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4">
                <div className="flex items-center gap-3 text-white">
                  <div className="flex size-8 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-sm font-semibold text-violet-200">
                    {index + 1}
                  </div>
                  <span className="font-medium">{step.title}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-zinc-400">{step.description}</p>
              </div>
            ))}

            <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4">
              <div className="flex items-center gap-2 text-white">
                <HardDriveDownloadIcon className="size-4 text-violet-300" />
                <span className="font-medium">Good to know</span>
              </div>
              <div className="mt-3 space-y-2">
                {quickNotes.map((note) => (
                  <div key={note} className="flex items-start gap-2 text-zinc-400">
                    <CheckCircle2Icon className="mt-1 size-4 shrink-0 text-violet-300" />
                    <p>{note}</p>
                  </div>
                ))}
              </div>
            </div>

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
      </PublicSection>
    </SitePageShell>
  );
}
