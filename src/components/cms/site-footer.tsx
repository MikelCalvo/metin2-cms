import Link from "next/link";

import { siteNavigationItems } from "@/components/cms/site-nav-items";

export function SiteFooter() {
  return (
    <footer className="rounded-[28px] border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/20 backdrop-blur-xl">
      <div className="flex flex-col gap-6 px-6 py-6 sm:px-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium text-white">Metin2 CMS private web roadmap</p>
          <p className="max-w-2xl text-sm leading-6 text-zinc-400">
            Player-facing site routes, the protected account center, live game-data surfaces and a modern item
            shop are being built as separate layers so the legacy server contract stays stable.
          </p>
        </div>

        <div className="space-y-3 lg:text-right">
          <div className="flex flex-wrap gap-2 lg:justify-end">
            {siteNavigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-zinc-300 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/login"
              className="rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1.5 text-sm text-violet-100 transition-colors hover:bg-violet-500/20"
            >
              Sign in
            </Link>
          </div>
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
            Private infrastructure and download endpoints stay outside the repository.
          </p>
        </div>
      </div>
    </footer>
  );
}
