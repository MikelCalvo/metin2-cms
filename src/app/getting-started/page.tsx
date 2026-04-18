import Link from "next/link";
import { ArrowRightIcon, DownloadIcon, KeyRoundIcon, ShieldCheckIcon, UserRoundPlusIcon } from "lucide-react";

import { CmsPageHeader } from "@/components/cms/page-shell";
import { PublicSection } from "@/components/cms/public-section";
import { SitePageShell } from "@/components/cms/site-page-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const onboardingSteps = [
  {
    title: "Create the account",
    description:
      "Register through the CMS so the live legacy account table and the new session layer stay aligned from the first step.",
    href: "/register",
    icon: <UserRoundPlusIcon className="size-4" />,
  },
  {
    title: "Sign in to the CMS",
    description:
      "Open the modern sign-in route first so the rest of the protected account workflow happens inside the new CMS surface.",
    href: "/login",
    icon: <ShieldCheckIcon className="size-4" />,
  },
  {
    title: "Secure the account",
    description:
      "Once signed in, use the account center as the canonical path for email, delete code, password updates and browser-session review.",
    href: "/account",
    icon: <KeyRoundIcon className="size-4" />,
  },
  {
    title: "Get the client build",
    description:
      "Retrieve the private package through the operator-controlled distribution path documented in the downloads route, then patch and play.",
    href: "/downloads",
    icon: <DownloadIcon className="size-4" />,
  },
] as const;

const firstSessionChecklist = [
  "confirm the account email is correct",
  "store the delete code somewhere safe",
  "rotate the password immediately if the account was shared manually",
  "close other CMS sessions if the account changed hands during setup",
] as const;

export default function GettingStartedPage() {
  return (
    <SitePageShell>
      <CmsPageHeader
        eyebrow="Getting started"
        title="From account creation to first successful session"
        description="This route replaces the old scattered onboarding path with a cleaner sequence: register, sign in to the CMS, secure the account, receive the private client package, then patch and play."
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
              <Link href="/recover">Recovery options</Link>
            </Button>
          </>
        }
      >
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Private server onboarding</div>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">CMS-first account trust</div>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Legacy-compatible credentials</div>
      </CmsPageHeader>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {onboardingSteps.map((step, index) => (
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
        eyebrow="First-session safety"
        title="What players should do right away"
        description="The website should be the trusted control surface for security-sensitive actions, even when the client itself is delivered privately."
        contentClassName="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]"
      >
        <Card className="border-white/10 bg-black/20 shadow-none">
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl text-white">Protected account checklist</CardTitle>
            <CardDescription className="text-sm leading-6 text-zinc-400">
              These are the actions worth reinforcing as soon as the first CMS session works.
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
            Recovery is already part of the modern CMS slice. If a player loses access, they should use the CMS recovery route rather than depending on the old web stack.
          </AlertDescription>
        </Alert>
      </PublicSection>

      <PublicSection
        eyebrow="What comes next"
        title="After onboarding, the next useful site surface is rankings"
        description="Once players can register, install and sign in cleanly, read-only ladders become the next feature that makes the web genuinely useful day to day."
        action={
          <Button asChild className="bg-violet-500 text-white shadow-lg shadow-violet-950/40 hover:bg-violet-400">
            <Link href="/rankings">
              Open rankings shell
              <ArrowRightIcon className="size-4" />
            </Link>
          </Button>
        }
      >
        <div className="rounded-[24px] border border-dashed border-white/10 bg-black/20 px-5 py-5 text-sm leading-6 text-zinc-400">
          The rankings route is intentionally being prepared as a clean site shell first. Live player and guild data can plug in next through dedicated read services, without mixing game-data query logic into onboarding pages.
        </div>
      </PublicSection>
    </SitePageShell>
  );
}
