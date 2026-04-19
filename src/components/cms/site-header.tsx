import Link from "next/link";

import { SiteNav } from "@/components/cms/site-nav";
import { Badge } from "@/components/ui/badge";

export function SiteHeader() {
  return (
    <header className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/20 backdrop-blur-xl">
      <div className="flex flex-col gap-5 px-5 py-5 sm:px-6 sm:py-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/" className="text-sm font-semibold tracking-[0.18em] text-white uppercase">
              Metin2 Portal
            </Link>
            <Badge variant="secondary" className="border border-white/10 bg-white/5 text-zinc-300">
              launcher-ready
            </Badge>
            <Badge variant="secondary" className="border border-violet-400/20 bg-violet-500/10 text-violet-200">
              Live ladders
            </Badge>
          </div>

          <SiteNav />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/register"
            data-slot="header-cta"
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-zinc-100 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white"
          >
            Create account
          </Link>

          <Link
            href="/login"
            data-slot="header-cta"
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-zinc-100 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white"
          >
            Sign in
          </Link>
        </div>
      </div>
    </header>
  );
}
