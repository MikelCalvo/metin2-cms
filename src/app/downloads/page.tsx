import Link from "next/link";
import {
  ArrowRightIcon,
  CheckCircle2Icon,
  DownloadIcon,
  HardDriveDownloadIcon,
  MonitorIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TerminalSquareIcon,
} from "lucide-react";

import { CmsPageHeader } from "@/components/cms/page-shell";
import { PublicSection } from "@/components/cms/public-section";
import { SitePageShell } from "@/components/cms/site-page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getPublicEnv } from "@/lib/env";

const compatibilityCards = [
  {
    title: "Official Windows support",
    description: "The default path is fully centered around Windows, from the starter pack to launcher-first updates.",
    icon: <MonitorIcon className="size-4" />,
  },
  {
    title: "Linux via Wine",
    description: "Linux players can stay on the same package and join through Wine instead of a separate community build.",
    icon: <SparklesIcon className="size-4" />,
  },
  {
    title: "Launcher included",
    description: "The same download ships the launcher and the base client, so the first session starts from one clear entrypoint.",
    icon: <DownloadIcon className="size-4" />,
  },
  {
    title: "Auto-updating launcher",
    description: "After install, the launcher that auto-updates the game keeps players aligned with the current live version.",
    icon: <ShieldCheckIcon className="size-4" />,
  },
] as const;

const installSteps = [
  {
    title: "Download the starter pack",
    description: "Grab the single package that already includes the launcher and the base game files.",
  },
  {
    title: "Run the launcher once",
    description: "Let it prepare folders and pull the latest game changes before the first sign-in.",
  },
  {
    title: "Sign in and play",
    description: "Use the same credentials you manage in the portal, then jump straight into the live world.",
  },
] as const;

const packageHighlights = [
  "One starter pack includes the launcher, client files and update path.",
  "Official Windows support is the primary path, with Linux via Wine covered in the same experience.",
  "Players can verify integrity through the SHA256 checksum before their first run.",
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
        title="Starter Pack + Auto-Updating Launcher"
        description="One polished desktop path for the whole first-session experience: official Windows support, Linux via Wine and a launcher that auto-updates the game after install."
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
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Launcher auto-updates the game</div>
      </CmsPageHeader>

      <PublicSection
        eyebrow="Current release"
        title={hasStarterPackDownload ? "One starter pack, one clear way to enter the server" : "Starter pack pending publication"}
        description={
          hasStarterPackDownload
            ? "The download surface is streamlined around a single package, the launcher and the verification path players expect from a live server."
            : "The page design is already ready for the live download flow. As soon as the starter-pack URL is configured, the main release card will turn into a live CTA."
        }
        contentClassName="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]"
      >
        <Card className="border-white/10 bg-black/20 shadow-none">
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl text-white">Starter pack release panel</CardTitle>
            <CardDescription className="text-sm leading-6 text-zinc-400">
              Built to feel like a real server download surface: the launcher, the client and the verification path live together in one primary card.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-6 text-zinc-300">
            <div className="grid gap-3 md:grid-cols-3">
              {packageHighlights.map((highlight) => (
                <div key={highlight} className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4">
                  {highlight}
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
                  <p className="text-[0.72rem] uppercase tracking-[0.16em] text-zinc-500">SHA256 verification</p>
                  <p className="mt-3 break-all font-mono text-sm text-zinc-200">
                    {starterPackChecksum || "Use the checksum file button above to verify the package before first launch."}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-zinc-500">
                    Compare this value with the downloaded `.sha256` file if you want to verify the starter pack manually before launching.
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 px-4 py-4 text-zinc-400">
                The live file is not configured yet. Once the starter-pack URL is present, this panel will expose the download and checksum actions automatically.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-black/20 shadow-none">
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl text-white">Compatibility at a glance</CardTitle>
            <CardDescription className="text-sm leading-6 text-zinc-400">
              The default messaging is already shaped for a real server release instead of a documentation-only handoff.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-6 text-zinc-300">
            {compatibilityCards.map((card) => (
              <div key={card.title} className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4">
                <div className="flex items-center gap-2 text-white">
                  <span className="flex size-8 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-violet-200">
                    {card.icon}
                  </span>
                  <span className="font-medium">{card.title}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-zinc-400">{card.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </PublicSection>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {compatibilityCards.map((card) => (
          <Card
            key={card.title}
            className="border-white/10 bg-white/[0.04] shadow-2xl shadow-black/20 backdrop-blur-xl"
          >
            <CardHeader className="space-y-3">
              <div className="flex size-10 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-violet-200">
                {card.icon}
              </div>
              <div className="space-y-2">
                <CardTitle className="text-xl text-white">{card.title}</CardTitle>
                <CardDescription className="text-sm leading-6 text-zinc-400">{card.description}</CardDescription>
              </div>
            </CardHeader>
          </Card>
        ))}
      </section>

      <PublicSection
        eyebrow="Install flow"
        title="From first click to first login in three steps"
        description="The download area is streamlined so the first session feels obvious even before custom launcher docs or patch notes are added."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {installSteps.map((step, index) => (
            <Card key={step.title} className="border-white/10 bg-black/20 shadow-none">
              <CardHeader className="space-y-3">
                <div className="flex size-10 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-sm font-semibold text-violet-200">
                  {index + 1}
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-lg text-white">{step.title}</CardTitle>
                  <CardDescription className="text-sm leading-6 text-zinc-400">{step.description}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </PublicSection>

      <PublicSection
        eyebrow="Support"
        title="Verification and first-session confidence"
        description="The launcher handles updates, but the page still surfaces the manual checks players look for before they run a large package for the first time."
        action={
          <Button
            asChild
            variant="outline"
            className="border-white/10 bg-white/5 text-zinc-100 hover:bg-white/10"
          >
            <Link href="/getting-started">Open getting started</Link>
          </Button>
        }
        contentClassName="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]"
      >
        <Card className="border-white/10 bg-black/20 shadow-none">
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl text-white">What players can verify here</CardTitle>
            <CardDescription className="text-sm leading-6 text-zinc-400">
              The portal already exposes the two trust signals people usually want before the first run: the main package and the checksum path.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-6 text-zinc-300">
            <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4">
              Download the package through the same player-facing route you would expose in production.
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4">
              Use the checksum route to validate the archive manually before the first launcher run.
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4">
              If everything matches, the launcher takes over future updates automatically.
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-black/20 shadow-none">
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl text-white">Inside the same download</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-6 text-zinc-300">
            <div className="flex items-start gap-3 rounded-3xl border border-white/10 bg-white/5 px-4 py-4">
              <CheckCircle2Icon className="mt-1 size-4 shrink-0 text-violet-300" />
              <p>Launcher entrypoint and first patch flow.</p>
            </div>
            <div className="flex items-start gap-3 rounded-3xl border border-white/10 bg-white/5 px-4 py-4">
              <CheckCircle2Icon className="mt-1 size-4 shrink-0 text-violet-300" />
              <p>Base client files for the first start on Windows or Linux via Wine.</p>
            </div>
            <div className="flex items-start gap-3 rounded-3xl border border-white/10 bg-white/5 px-4 py-4">
              <CheckCircle2Icon className="mt-1 size-4 shrink-0 text-violet-300" />
              <p>Checksum route for manual verification before running the package.</p>
            </div>
            <div className="flex items-start gap-3 rounded-3xl border border-white/10 bg-white/5 px-4 py-4">
              <TerminalSquareIcon className="mt-1 size-4 shrink-0 text-violet-300" />
              <p>One message for both official Windows support and Linux via Wine instead of split download pages.</p>
            </div>
          </CardContent>
        </Card>
      </PublicSection>
    </SitePageShell>
  );
}
