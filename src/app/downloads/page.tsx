import Link from "next/link";
import { ArrowRightIcon, DownloadIcon, LockIcon, ShieldCheckIcon, SparklesIcon, WrenchIcon } from "lucide-react";

import { CmsPageHeader } from "@/components/cms/page-shell";
import { PublicSection } from "@/components/cms/public-section";
import { SitePageShell } from "@/components/cms/site-page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
  return (
    <SitePageShell>
      <CmsPageHeader
        eyebrow="Downloads"
        title="Private download center and install flow"
        description="This route is the clean replacement for the old download box and launcher funnel. It explains how the private client package should be delivered and used, without publishing sensitive URLs or environment-specific details in the repository."
        actions={
          <>
            <Button asChild className="bg-violet-500 text-white shadow-lg shadow-violet-950/40 hover:bg-violet-400">
              <Link href="/getting-started">
                Continue to onboarding
                <ArrowRightIcon className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-white/10 bg-white/5 text-zinc-100 hover:bg-white/10"
            >
              <Link href="/login">Open sign in</Link>
            </Button>
          </>
        }
      >
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Private delivery only</div>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">No infra URLs in git</div>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Launcher flow comes later</div>
      </CmsPageHeader>

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
