import Link from "next/link";
import {
  ArrowRightIcon,
  DownloadIcon,
  KeyRoundIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TrophyIcon,
  UserRoundPlusIcon,
} from "lucide-react";

import { CmsPageHeader } from "@/components/cms/page-shell";
import { PublicSection } from "@/components/cms/public-section";
import { SitePageShell } from "@/components/cms/site-page-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const playerSteps = [
  {
    title: "Create your account",
    description: "Register first so your login is ready before the launcher finishes its first sync.",
    href: "/register",
    icon: <UserRoundPlusIcon className="size-4" />,
  },
  {
    title: "Download the starter pack",
    description: "Grab the launcher and base client from the downloads route.",
    href: "/downloads",
    icon: <DownloadIcon className="size-4" />,
  },
  {
    title: "Run the launcher once",
    description: "Let it patch to the current live version before the first sign-in.",
    href: "/downloads",
    icon: <SparklesIcon className="size-4" />,
  },
  {
    title: "Enter and secure the account",
    description: "Log in, keep the account details safe and use recovery if you ever lose access.",
    href: "/login",
    icon: <KeyRoundIcon className="size-4" />,
  },
] as const;

const firstSessionChecklist = [
  "confirm the account email before your first long session",
  "save the delete code somewhere safe",
  "use the recovery route if the login ever stops working",
  "come back to the portal for rankings, downloads and account actions",
] as const;

const nextLinks = [
  {
    title: "Downloads",
    description: "Grab or re-open the starter pack route whenever you need the launcher again.",
    href: "/downloads",
    label: "Open downloads",
    icon: <DownloadIcon className="size-4" />,
  },
  {
    title: "Rankings",
    description: "Check the live ladder once you are in and starting to climb.",
    href: "/rankings",
    label: "View rankings",
    icon: <TrophyIcon className="size-4" />,
  },
  {
    title: "Recovery",
    description: "If something goes wrong, use the recovery flow from the same portal.",
    href: "/recover",
    label: "Open recovery",
    icon: <ShieldCheckIcon className="size-4" />,
  },
] as const;

export default function GettingStartedPage() {
  return (
    <SitePageShell>
      <CmsPageHeader
        eyebrow="Getting started"
        title="Create account. Download. Patch. Enter."
        description="This is the short path to the first real session: make the account, grab the starter pack, let the launcher sync and step into the server."
        actions={
          <>
            <Button asChild className="bg-violet-500 text-white shadow-lg shadow-violet-950/40 hover:bg-violet-400">
              <Link href="/register">
                Create account
                <ArrowRightIcon className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-white/10 bg-white/5 text-zinc-100 hover:bg-white/10"
            >
              <Link href="/downloads">Open downloads</Link>
            </Button>
          </>
        }
      >
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Official Windows support</div>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Linux via Wine</div>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Launcher auto-updates the game</div>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Recovery route ready</div>
      </CmsPageHeader>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {playerSteps.map((step, index) => (
          <Card key={step.title} className="border-white/10 bg-white/[0.04] shadow-2xl shadow-black/20 backdrop-blur-xl">
            <CardHeader className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-violet-200">
                  {step.icon}
                </div>
                <span className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">Step {index + 1}</span>
              </div>
              <div className="space-y-2">
                <CardTitle className="text-xl text-white">{step.title}</CardTitle>
                <CardDescription className="text-sm leading-6 text-zinc-400">{step.description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                asChild
                variant="ghost"
                className="px-0 text-zinc-300 hover:bg-transparent hover:text-white"
              >
                <Link href={step.href}>
                  Open step
                  <ArrowRightIcon className="size-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>

      <PublicSection
        eyebrow="Before first login"
        title="Keep the first session smooth"
        description="A few tiny checks now save a lot of friction later."
        contentClassName="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]"
      >
        <Card className="border-white/10 bg-black/20 shadow-none">
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl text-white">Quick checklist</CardTitle>
            <CardDescription className="text-sm leading-6 text-zinc-400">
              The player-facing essentials worth handling before the long session starts.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {firstSessionChecklist.map((item) => (
              <div key={item} className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-zinc-300">
                {item}
              </div>
            ))}
          </CardContent>
        </Card>

        <Alert className="border-white/10 bg-black/20 text-zinc-100">
          <KeyRoundIcon className="size-4" />
          <AlertTitle>Recovery matters from day one</AlertTitle>
          <AlertDescription className="text-zinc-400">
            If a player loses access, the recovery route is already part of the modern portal. Use that path instead of hunting around old web surfaces.
          </AlertDescription>
        </Alert>
      </PublicSection>

      <PublicSection
        eyebrow="After you are in"
        title="The other routes worth keeping close"
        description="Once the first login works, these are the pages that stay useful every day."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {nextLinks.map((link) => (
            <Card key={link.href} className="border-white/10 bg-black/20 shadow-none">
              <CardHeader className="space-y-3">
                <div className="flex size-10 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-violet-200">
                  {link.icon}
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-lg text-white">{link.title}</CardTitle>
                  <CardDescription className="text-sm leading-6 text-zinc-400">{link.description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  asChild
                  variant="ghost"
                  className="px-0 text-zinc-300 hover:bg-transparent hover:text-white"
                >
                  <Link href={link.href}>
                    {link.label}
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
