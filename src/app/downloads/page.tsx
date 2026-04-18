import Link from "next/link";
import { ArrowRightIcon, DownloadIcon, LockIcon, ShieldCheckIcon, SparklesIcon, WrenchIcon } from "lucide-react";

import { CmsPageHeader } from "@/components/cms/page-shell";
import { PublicSection } from "@/components/cms/public-section";
import { SitePageShell } from "@/components/cms/site-page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getPublicEnv } from "@/lib/env";

const downloadSteps = [
  {
    title: "Get the private client package",
    description:
      "Client delivery remains intentionally private. Operators can share the current launcher or client build without exposing infrastructure URLs in the repo.",
    icon: <LockIcon className="size-4" />,
  },
  {
    title: "Install and patch cleanly",
    description:
      "Use the provided package as the source of truth, then let the private update flow patch the client before the first session.",
    icon: <WrenchIcon className="size-4" />,
  },
  {
    title: "Sign in with the CMS account",
    description:
      "The web account and the live server credentials stay aligned, so onboarding can move from registration to login without old PHP surfaces.",
    icon: <ShieldCheckIcon className="size-4" />,
  },
] as const;

const futureModules = [
  "current client release notes",
  "launcher and patcher guidance",
  "install troubleshooting",
  "manual checksum and package notes",
  "later download history or changelog surfaces",
] as const;

export default function DownloadsPage() {
  const starterPackUrl = getPublicEnv().STARTER_PACK_URL;
  const hasStarterPackDownload = Boolean(starterPackUrl);

  return (
    <SitePageShell>
      <CmsPageHeader
        eyebrow="Downloads"
        title="Private download center and install flow"
        description="This route is the clean replacement for the old download box and launcher funnel. It explains how the private client package should be delivered and used, without publishing sensitive URLs or environment-specific details in the repository."
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
                  Continue to onboarding
                  <ArrowRightIcon className="size-4" />
                </Link>
              </Button>
            )}
            <Button
              asChild
              variant="outline"
              className="border-white/10 bg-white/5 text-zinc-100 hover:bg-white/10"
            >
              <Link href={hasStarterPackDownload ? "/getting-started" : "/login"}>
                {hasStarterPackDownload ? "Open getting started" : "Open sign in"}
              </Link>
            </Button>
          </>
        }
      >
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
          {hasStarterPackDownload ? "Starter pack ready" : "Starter pack pending"}
        </div>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">No infra URLs in git</div>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Launcher flow comes later</div>
      </CmsPageHeader>

      <PublicSection
        eyebrow="Starter pack"
        title={hasStarterPackDownload ? "The private starter pack is ready to download" : "Starter pack pending publication"}
        description={
          hasStarterPackDownload
            ? "The CMS now exposes a stable download entrypoint without hardcoding the underlying distribution endpoint in git."
            : "This page is already wired for the starter pack, but the private distribution URL has not been configured in the CMS environment yet."
        }
        contentClassName="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]"
      >
        <Card className="border-white/10 bg-black/20 shadow-none">
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl text-white">Canonical download entrypoint</CardTitle>
            <CardDescription className="text-sm leading-6 text-zinc-400">
              The public UI links to an internal CMS route first, so the page does not expose environment-specific storage or reverse-proxy details directly in markup.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-6 text-zinc-300">
            <p>
              The starter pack remains a private asset, but players can now use a single stable button from the CMS instead of relying on side-channel instructions.
            </p>
            {hasStarterPackDownload ? (
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
                  <Link href="/downloads/client/checksum">SHA256 checksum</Link>
                </Button>
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 px-4 py-4 text-zinc-400">
                The file is not published yet. Once STARTER_PACK_URL is configured on the server, this section will expose the live download button automatically.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-black/20 shadow-none">
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl text-white">Why this shape</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-6 text-zinc-300">
            <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4">
              The starter pack URL lives in environment configuration, not in committed source.
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4">
              The page can stay stable even if the backing distribution host changes later.
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4">
              Future launcher/update improvements can keep reusing this route as the canonical download surface.
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4">
              Checksum verification is exposed through a CMS-owned route as well, so players can validate the package without seeing the backing host details.
            </div>
          </CardContent>
        </Card>
      </PublicSection>

      <section className="grid gap-4 xl:grid-cols-3">
        {downloadSteps.map((step) => (
          <Card key={step.title} className="border-white/10 bg-white/[0.04] shadow-2xl shadow-black/20 backdrop-blur-xl">
            <CardHeader className="space-y-3">
              <div className="flex size-10 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-violet-200">
                {step.icon}
              </div>
              <div className="space-y-2">
                <CardTitle className="text-xl text-white">{step.title}</CardTitle>
                <CardDescription className="text-sm leading-6 text-zinc-400">{step.description}</CardDescription>
              </div>
            </CardHeader>
          </Card>
        ))}
      </section>

      <PublicSection
        eyebrow="What this route owns"
        title="Download guidance first, automated delivery later"
        description="The immediate goal is giving players and operators a canonical private place for install guidance. Actual package transport and launcher release mechanics can remain outside the repo until the product surface is stable."
        contentClassName="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]"
      >
        <Card className="border-white/10 bg-black/20 shadow-none">
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl text-white">Current recommended posture</CardTitle>
            <CardDescription className="text-sm leading-6 text-zinc-400">
              Keep the delivery path private, but make the onboarding instructions first-class so the website stops depending on side-channel explanations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-6 text-zinc-300">
            <p>
              The repository should never become the place where private distribution endpoints, proxy details or operator-only URLs are embedded. This page can still explain the workflow clearly: receive the current package, install it, patch it, then sign in.
            </p>
            <p>
              Once the rest of the site shell is stable, this route can expand into release notes, known issues and a more structured launcher or patcher experience.
            </p>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-black/20 shadow-none">
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl text-white">Planned modules</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {futureModules.map((module) => (
              <div key={module} className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300">
                {module}
              </div>
            ))}
          </CardContent>
        </Card>
      </PublicSection>

      <PublicSection
        eyebrow="Player path"
        title="After the package is in hand"
        description="Downloads are only one step. The next route explains the onboarding path from account setup to first successful session."
        action={
          <Button asChild className="bg-violet-500 text-white shadow-lg shadow-violet-950/40 hover:bg-violet-400">
            <Link href="/getting-started">
              Open getting started
              <ArrowRightIcon className="size-4" />
            </Link>
          </Button>
        }
      >
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-black/20 px-4 py-4">
            <div className="flex items-center gap-2 text-white">
              <DownloadIcon className="size-4 text-violet-300" />
              <span className="font-medium">Install</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-zinc-400">Place the package in the expected local path and avoid mixing old client trees with the new build source of truth.</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-black/20 px-4 py-4">
            <div className="flex items-center gap-2 text-white">
              <ShieldCheckIcon className="size-4 text-violet-300" />
              <span className="font-medium">Authenticate</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-zinc-400">Use the same credentials managed through the CMS account and recovery flows.</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-black/20 px-4 py-4">
            <div className="flex items-center gap-2 text-white">
              <SparklesIcon className="size-4 text-violet-300" />
              <span className="font-medium">Patch and play</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-zinc-400">The website becomes the canonical explanation layer even when the actual package transport remains private.</p>
          </div>
        </div>
      </PublicSection>
    </SitePageShell>
  );
}
