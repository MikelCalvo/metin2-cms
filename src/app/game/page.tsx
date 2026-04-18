import Link from "next/link";
import {
  ArrowRightIcon,
  BoxesIcon,
  CrownIcon,
  ShieldCheckIcon,
  SparklesIcon,
  SwordsIcon,
} from "lucide-react";

import { CmsPageHeader } from "@/components/cms/page-shell";
import { PublicSection } from "@/components/cms/public-section";
import { SitePageShell } from "@/components/cms/site-page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const productLayers = [
  {
    title: "Legacy-safe identity",
    description:
      "The live account table remains the source of truth for login, password, email, delete code and legacy balances.",
    icon: <ShieldCheckIcon className="size-4" />,
  },
  {
    title: "CMS-owned product layer",
    description:
      "Sessions, audit, recovery and all future player-facing routes, rankings and shop features stay under the CMS schema and UI layer.",
    icon: <BoxesIcon className="size-4" />,
  },
  {
    title: "Modern presentation runway",
    description:
      "The private website is being rebuilt as a proper player portal instead of repeating the one-page legacy CMS shape.",
    icon: <SparklesIcon className="size-4" />,
  },
] as const;

const featureTracks = [
  {
    title: "Public product web",
    description: "Landing, game overview, downloads and onboarding give the private site a coherent structure before live-data and shop work land.",
  },
  {
    title: "Account and trust",
    description: "The account center already covers the main trust foundations: authentication, recovery, session review and protected profile actions.",
  },
  {
    title: "Rankings and read models",
    description: "The next read-only expansion will expose ladders and game-data views through dedicated CMS services instead of scattered page queries.",
  },
  {
    title: "Commerce and operations",
    description: "The item shop and later admin tooling will sit on top of explicit catalog and audit boundaries rather than ad hoc legacy assumptions.",
  },
] as const;

export default function GamePage() {
  return (
    <SitePageShell>
      <CmsPageHeader
        eyebrow="Game overview"
        title="A modern private web for a legacy Metin2 server"
        description="The goal is not to imitate the old CMS one-to-one. It is to preserve the useful product areas—account access, downloads, rankings and shop—while rebuilding them with cleaner boundaries, stronger security and a reusable UI system."
        actions={
          <>
            <Button asChild className="bg-violet-500 text-white shadow-lg shadow-violet-950/40 hover:bg-violet-400">
              <Link href="/getting-started">
                Start onboarding
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
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Legacy-compatible account model</div>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Private infrastructure</div>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Modern CMS visual system</div>
      </CmsPageHeader>

      <section className="grid gap-4 xl:grid-cols-3">
        {productLayers.map((layer) => (
          <Card key={layer.title} className="border-white/10 bg-white/[0.04] shadow-2xl shadow-black/20 backdrop-blur-xl">
            <CardHeader className="space-y-3">
              <div className="flex size-10 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-violet-200">
                {layer.icon}
              </div>
              <div className="space-y-2">
                <CardTitle className="text-xl text-white">{layer.title}</CardTitle>
                <CardDescription className="text-sm leading-6 text-zinc-400">
                  {layer.description}
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        ))}
      </section>

      <PublicSection
        eyebrow="What the web needs to cover"
        title="Four product tracks, one coherent portal"
        description="The private site is being shaped around distinct domains so each one can evolve without pushing unnecessary complexity into the others."
      >
        <div className="grid gap-4 md:grid-cols-2">
          {featureTracks.map((track) => (
            <Card key={track.title} className="border-white/10 bg-black/20 shadow-none">
              <CardHeader className="space-y-2">
                <CardTitle className="text-lg text-white">{track.title}</CardTitle>
                <CardDescription className="text-sm leading-6 text-zinc-400">{track.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </PublicSection>

      <PublicSection
        eyebrow="Current posture"
        title="Modern at the product layer, conservative at the compatibility layer"
        description="That trade-off is deliberate. The private web can move quickly on UI, IA and CMS-owned workflows while the live legacy server contract remains stable."
        contentClassName="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]"
      >
        <Card className="border-white/10 bg-black/20 shadow-none">
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl text-white">Why this order matters</CardTitle>
            <CardDescription className="text-sm leading-6 text-zinc-400">
              Read-only and informational surfaces are safer to iterate on first, and they give the later monetization work a stable shell to plug into.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-6 text-zinc-300">
            <p>
              The current auth and account foundation proves the compatibility boundary. The player-facing routes now need to catch up so the site feels like a product, not only a secure login screen.
            </p>
            <p>
              Once the shared site shell is in place, rankings can land as read-only game-data views. Only after that does the item shop start adding catalog and audited order state.
            </p>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-black/20 shadow-none">
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl text-white">Player-facing entry points</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4">
              <div className="flex items-center gap-2 text-white">
                <SwordsIcon className="size-4 text-violet-300" />
                <span className="font-medium">Game overview</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-zinc-400">Explain what the server offers and how the modern web is organized.</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4">
              <div className="flex items-center gap-2 text-white">
                <CrownIcon className="size-4 text-violet-300" />
                <span className="font-medium">Rankings</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-zinc-400">Expose player progression and competitive visibility through safe read-only services.</p>
            </div>
          </CardContent>
        </Card>
      </PublicSection>
    </SitePageShell>
  );
}
