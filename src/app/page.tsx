import Link from "next/link";
import {
  ArrowRightIcon,
  CompassIcon,
  CreditCardIcon,
  DownloadIcon,
  ShieldCheckIcon,
  SwordsIcon,
  TrophyIcon,
} from "lucide-react";

import { CmsPageHeader } from "@/components/cms/page-shell";
import { PublicSection } from "@/components/cms/public-section";
import { SitePageShell } from "@/components/cms/site-page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const foundationPillars = [
  {
    title: "Trust and account security",
    description:
      "Legacy-compatible login, registration, recovery, session management and audit history already run on the new CMS stack.",
    icon: <ShieldCheckIcon className="size-4" />,
  },
  {
    title: "Gameplay-facing private web",
    description:
      "The next slice turns the project into a proper private player portal with game, onboarding and download surfaces instead of only auth routes.",
    icon: <CompassIcon className="size-4" />,
  },
  {
    title: "Rankings and item shop runway",
    description:
      "Once the shared site shell is stable, live data and audited commerce flows can land without inheriting old PHP architecture.",
    icon: <CreditCardIcon className="size-4" />,
  },
] as const;

const deliveryAreas = [
  {
    title: "Game overview",
    description: "Explain the product, the server identity and the modern web direction without relying on the old CMS layout.",
    href: "/game",
    icon: <SwordsIcon className="size-4" />,
  },
  {
    title: "Private downloads",
    description: "Document the client delivery and install flow without hardcoding private endpoints or infrastructure details into the repository.",
    href: "/downloads",
    icon: <DownloadIcon className="size-4" />,
  },
  {
    title: "Player onboarding",
    description: "Give new players a clean path from account creation to first login, patching and session security basics.",
    href: "/getting-started",
    icon: <ArrowRightIcon className="size-4" />,
  },
  {
    title: "Rankings runway",
    description: "Prepare the site shell where read-only ladders and later character or guild data can connect cleanly.",
    href: "/rankings",
    icon: <TrophyIcon className="size-4" />,
  },
] as const;

const executionOrder = [
  "Shared site navigation and reusable route shells",
  "Game, downloads and getting-started routes",
  "Rankings read models and ladder presentation",
  "Item shop catalog, pricing and audited order flows",
  "Admin and editorial tooling",
] as const;

export default function Home() {
  return (
    <SitePageShell>
      <CmsPageHeader
        eyebrow="Private player web"
        title="Modern Metin2 CMS foundation for account, rankings and item shop work"
        description="The current stack already covers legacy-compatible auth and the account center. The next milestone is turning that base into a coherent private player portal with player-facing routes, onboarding and read-only game-data surfaces."
        actions={
          <>
            <Button asChild className="bg-violet-500 text-white shadow-lg shadow-violet-950/40 hover:bg-violet-400">
              <Link href="/account">
                Open account center
                <ArrowRightIcon className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-white/10 bg-white/5 text-zinc-100 hover:bg-white/10"
            >
              <Link href="/downloads">Download guide</Link>
            </Button>
          </>
        }
      >
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Private distribution flow</div>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Legacy-safe identity</div>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Next up: rankings + shop</div>
      </CmsPageHeader>

      <section className="grid gap-4 xl:grid-cols-3">
        {foundationPillars.map((pillar) => (
          <Card
            key={pillar.title}
            className="border-white/10 bg-white/[0.04] shadow-2xl shadow-black/20 backdrop-blur-xl"
          >
            <CardHeader className="space-y-3">
              <div className="flex size-10 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-violet-200">
                {pillar.icon}
              </div>
              <div className="space-y-2">
                <CardTitle className="text-xl text-white">{pillar.title}</CardTitle>
                <CardDescription className="text-sm leading-6 text-zinc-400">
                  {pillar.description}
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        ))}
      </section>

      <PublicSection
        eyebrow="Roadmap alignment"
        title="What this modern web is replacing"
        description="The old Metin2 portal bundled marketing pages, downloads, onboarding, rankings, account access and item shop ideas into one legacy surface. The modern replacement keeps those areas, but separates them into cleaner product layers."
        contentClassName="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.95fr)]"
      >
        <Card className="border-white/10 bg-black/20 shadow-none">
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl text-white">Structured replacement domains</CardTitle>
            <CardDescription className="text-sm leading-6 text-zinc-400">
              Build the private web as player-facing site routes, account and trust, live game-data views, then commerce and operations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4">
                <p className="text-[0.72rem] uppercase tracking-[0.16em] text-zinc-500">Public web</p>
                <p className="mt-2 text-sm leading-6 text-zinc-300">
                  Landing, game, downloads and onboarding routes establish the structure the rest of the site can grow into.
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4">
                <p className="text-[0.72rem] uppercase tracking-[0.16em] text-zinc-500">Account and trust</p>
                <p className="mt-2 text-sm leading-6 text-zinc-300">
                  Auth, sessions, recovery and the account center stay isolated from the rest of the site information layer.
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4">
                <p className="text-[0.72rem] uppercase tracking-[0.16em] text-zinc-500">Read-only game data</p>
                <p className="mt-2 text-sm leading-6 text-zinc-300">
                  Rankings and later character or guild pages should connect through dedicated read models instead of raw page-level queries.
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4">
                <p className="text-[0.72rem] uppercase tracking-[0.16em] text-zinc-500">Commerce</p>
                <p className="mt-2 text-sm leading-6 text-zinc-300">
                  The item shop lands after the site shell is coherent, with catalog and order auditing owned by the CMS schema.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-black/20 shadow-none">
          <CardHeader className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="border border-white/10 bg-white/5 text-zinc-300">
                Current order
              </Badge>
              <Badge variant="secondary" className="border border-violet-400/20 bg-violet-500/10 text-violet-200">
                Safe path
              </Badge>
            </div>
            <CardTitle className="text-xl text-white">Execution order from here</CardTitle>
            <CardDescription className="text-sm leading-6 text-zinc-400">
              Read-heavy surfaces first, stateful shop flows afterwards.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {executionOrder.map((step, index) => (
              <div key={step} className="flex items-start gap-3 rounded-3xl border border-white/10 bg-white/5 px-4 py-4">
                <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/20 text-xs font-semibold text-zinc-300">
                  {index + 1}
                </div>
                <p className="text-sm leading-6 text-zinc-300">{step}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </PublicSection>

      <PublicSection
        eyebrow="Route map"
        title="Start from the right surface"
        description="Each route below is part of the current implementation slice and is intentionally framed so later rankings, news and item shop work can reuse the same shell."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {deliveryAreas.map((area) => (
            <Card key={area.href} className="border-white/10 bg-black/20 shadow-none">
              <CardHeader className="space-y-3">
                <div className="flex size-10 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-violet-200">
                  {area.icon}
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-lg text-white">{area.title}</CardTitle>
                  <CardDescription className="text-sm leading-6 text-zinc-400">
                    {area.description}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <Separator className="bg-white/8" />
                <Button
                  asChild
                  variant="ghost"
                  className="mt-4 px-0 text-zinc-300 hover:bg-transparent hover:text-white"
                >
                  <Link href={area.href}>
                    Open route
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
