import Link from "next/link";

import { siteNavigationItems } from "@/components/cms/site-nav-items";

export function SiteFooter() {
  return (
    <footer className="rounded-[28px] border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/20 backdrop-blur-xl">
      <div className="flex flex-col gap-4 px-6 py-6 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
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

        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Windows · Linux</p>
      </div>
    </footer>
  );
}
