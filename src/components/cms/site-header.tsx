import Link from "next/link";
import { ArrowRightIcon, DownloadIcon, ShieldCheckIcon, UserRoundPlusIcon } from "lucide-react";

import { SiteNav } from "@/components/cms/site-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/20 backdrop-blur-xl">
      <div className="flex flex-col gap-6 px-5 py-5 sm:px-6 sm:py-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/" className="text-sm font-semibold tracking-[0.18em] text-white uppercase">
              Metin2 Portal
            </Link>
            <Badge variant="secondary" className="border border-white/10 bg-white/5 text-zinc-300">
              Launcher-ready
            </Badge>
            <Badge variant="secondary" className="border border-violet-400/20 bg-violet-500/10 text-violet-200">
              Live ladders
            </Badge>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-400">
              <ShieldCheckIcon className="size-4 text-violet-300" />
              <span>Download the client, patch fast, recover access if needed and keep up with rankings from one server hub.</span>
            </div>
            <SiteNav />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            asChild
            variant="outline"
            className="border-white/10 bg-white/5 text-zinc-100 hover:bg-white/10"
          >
            <Link href="/downloads">
              <DownloadIcon className="size-4" />
              Downloads
            </Link>
          </Button>

          <Button asChild className="bg-violet-500 text-white shadow-lg shadow-violet-950/40 hover:bg-violet-400">
            <Link href="/register">
              <UserRoundPlusIcon className="size-4" />
              Create account
              <ArrowRightIcon className="size-4" />
            </Link>
          </Button>

          <Link href="/login" className="text-sm text-zinc-400 transition-colors hover:text-white">
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </header>
  );
}
