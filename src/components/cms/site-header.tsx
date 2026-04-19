"use client";

import Link from "next/link";

import { SiteNav } from "@/components/cms/site-nav";
import { LocaleSwitcher } from "@/components/i18n/locale-switcher";
import { useI18n } from "@/components/i18n/i18n-provider";
import { Badge } from "@/components/ui/badge";

export function SiteHeader() {
  const { messages } = useI18n();

  return (
    <header
      data-slot="header-card"
      className="relative z-20 overflow-visible rounded-[28px] border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/20 backdrop-blur-xl"
    >
      <div className="flex flex-col gap-5 px-5 py-5 sm:px-6 sm:py-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/" className="text-sm font-semibold tracking-[0.18em] text-white uppercase">
              {messages.header.brand}
            </Link>
            <Badge variant="secondary" className="border border-white/10 bg-white/5 text-zinc-300">
              {messages.header.launcherReady}
            </Badge>
            <Badge variant="secondary" className="border border-violet-400/20 bg-violet-500/10 text-violet-200">
              {messages.header.liveLadders}
            </Badge>
          </div>

          <SiteNav />
        </div>

        <div data-slot="header-right-actions" className="flex flex-wrap items-center gap-3 lg:justify-end">
          <LocaleSwitcher />

          <Link
            href="/register"
            data-slot="header-cta"
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-zinc-100 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white"
          >
            {messages.header.createAccount}
          </Link>

          <Link
            href="/login"
            data-slot="header-cta"
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-zinc-100 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white"
          >
            {messages.header.signIn}
          </Link>
        </div>
      </div>
    </header>
  );
}
