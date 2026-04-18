import Link from "next/link";
import {
  ArrowRightIcon,
  BoxesIcon,
  CreditCardIcon,
  LayoutDashboardIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from "lucide-react";

import { CmsPageHeader, CmsPageShell } from "@/components/cms/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getCurrentAuthenticatedAccount } from "@/server/auth/current-account";

const productPillars = [
  {
    title: "Modern auth surface",
    description:
      "Login, registration, recovery and account security already run on the new Next.js stack with CMS-owned sessions.",
    icon: <ShieldCheckIcon className="size-4" />,
  },
  {
    title: "Legacy-safe data model",
    description:
      "The live account.account schema remains the source of truth while CMS-specific data stays isolated in metin2_cms.",
    icon: <BoxesIcon className="size-4" />,
  },
  {
    title: "Ready for item shop growth",
    description:
      "The same visual system can now expand into rankings, administration and a modern item shop without reusing old PHP architecture.",
    icon: <CreditCardIcon className="size-4" />,
  },
] as const;

const roadmapPhases = [
  "Auth and recovery",
  "Account center",
  "Public landing and brand layer",
  "Item shop and purchase flow",
  "Admin and operational tooling",
] as const;

export default async function Home() {
  const authenticated = await getCurrentAuthenticatedAccount();
  const primaryHref = authenticated ? "/account" : "/login";
  const primaryLabel = authenticated ? "Open account center" : "Sign in";

  return (
    <CmsPageShell>
      <CmsPageHeader
        eyebrow="Metin2 CMS"
        title="Modern control panel + item shop foundation for a legacy Metin2 stack"
        description="A dark-first product surface built with Next.js, SSR and a clean CMS-owned session layer, while staying compatible with the live legacy account database contract."
        actions={
          <>
            <Button asChild className="bg-violet-500 text-white shadow-lg shadow-violet-950/40 hover:bg-violet-400">
              <Link href={primaryHref}>
                {primaryLabel}
                <ArrowRightIcon className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-white/10 bg-white/5 text-zinc-100 hover:bg-white/10"
            >
              <Link href="/register">Create account</Link>
            </Button>
          </>
        }
      >
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
          Next.js SSR + server actions
        </div>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
          Legacy MariaDB as source of truth
        </div>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
          shadcn/ui design layer in progress
        </div>
      </CmsPageHeader>

      <section className="grid gap-4 xl:grid-cols-3">
        {productPillars.map((pillar) => (
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

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)]">
        <Card className="border-white/10 bg-white/[0.04] shadow-2xl shadow-black/20 backdrop-blur-xl">
          <CardHeader className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-zinc-500">
              Architecture
            </p>
            <CardTitle className="text-2xl text-white">Built to coexist with the legacy server, not fight it</CardTitle>
            <CardDescription className="text-sm leading-6 text-zinc-400">
              The CMS is intentionally modern at the product layer and intentionally conservative at the compatibility layer.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-black/20 px-4 py-4">
                <p className="text-[0.72rem] uppercase tracking-[0.16em] text-zinc-500">Auth truth</p>
                <p className="mt-2 text-sm leading-6 text-zinc-300">
                  Login, email, password hash and delete code still come from the real account table.
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-black/20 px-4 py-4">
                <p className="text-[0.72rem] uppercase tracking-[0.16em] text-zinc-500">CMS state</p>
                <p className="mt-2 text-sm leading-6 text-zinc-300">
                  Sessions, audit log and future product features stay isolated in metin2_cms for safer evolution.
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-black/20 px-4 py-4">
                <p className="text-[0.72rem] uppercase tracking-[0.16em] text-zinc-500">Workflow</p>
                <p className="mt-2 text-sm leading-6 text-zinc-300">
                  shadcn/ui primitives, strict TypeScript and SSR-first routes give us a modern base for long-term maintenance.
                </p>
              </div>
            </div>

            <Separator className="bg-white/8" />

            <div className="flex flex-wrap gap-3">
              <Button asChild className="bg-violet-500 text-white hover:bg-violet-400">
                <Link href="/recover">Test recovery flow</Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                className="px-0 text-zinc-300 hover:bg-transparent hover:text-white"
              >
                <Link href="/register">Create a legacy-compatible account</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/[0.04] shadow-2xl shadow-black/20 backdrop-blur-xl">
          <CardHeader className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="border border-white/10 bg-white/5 text-zinc-300">
                Current roadmap
              </Badge>
              <Badge variant="secondary" className="border border-violet-400/20 bg-violet-500/10 text-violet-200">
                In motion
              </Badge>
            </div>
            <CardTitle className="text-2xl text-white">What comes after the auth foundation</CardTitle>
            <CardDescription className="text-sm leading-6 text-zinc-400">
              The design system is now being pushed across the public and authenticated surfaces so the CMS starts feeling like one product.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {roadmapPhases.map((phase, index) => (
              <div
                key={phase}
                className="flex items-start gap-3 rounded-3xl border border-white/10 bg-black/20 px-4 py-4"
              >
                <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs font-semibold text-zinc-300">
                  {index + 1}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-white">{phase}</p>
                  {index < 2 ? (
                    <p className="text-sm leading-6 text-zinc-400">Already implemented and being polished with the new visual layer.</p>
                  ) : index === 2 ? (
                    <p className="text-sm leading-6 text-zinc-400">Current focus while we harden the shared shells and product language.</p>
                  ) : (
                    <p className="text-sm leading-6 text-zinc-400">Queued next once the public/auth surfaces feel coherent enough.</p>
                  )}
                </div>
              </div>
            ))}

            <div className="rounded-3xl border border-dashed border-white/10 bg-black/20 px-4 py-4 text-sm text-zinc-400">
              <div className="flex items-center gap-2 text-zinc-300">
                <SparklesIcon className="size-4 text-violet-300" />
                <span className="font-medium">Design direction</span>
              </div>
              <p className="mt-2 leading-6">
                Product-first, dark premium, closer to Linear/Vercel than to a classic MMO control panel. Theming specific to the server brand can come later.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-4 rounded-[30px] border border-white/10 bg-white/[0.04] px-6 py-5 shadow-2xl shadow-black/20 backdrop-blur-xl">
        <div className="space-y-1">
          <p className="text-sm font-medium text-white">Already authenticated?</p>
          <p className="text-sm leading-6 text-zinc-400">
            Jump straight into the account center to manage profile data, sessions and password security.
          </p>
        </div>
        <Button asChild variant="outline" className="border-white/10 bg-white/5 text-zinc-100 hover:bg-white/10">
          <Link href={authenticated ? "/account" : "/login"}>
            <LayoutDashboardIcon className="size-4" />
            {authenticated ? "Open dashboard" : "Go to sign in"}
          </Link>
        </Button>
      </section>
    </CmsPageShell>
  );
}
