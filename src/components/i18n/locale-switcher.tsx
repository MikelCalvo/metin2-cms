"use client";

import { useRouter } from "next/navigation";

import {
  getLocaleMeta,
  supportedLocales,
  type Locale,
} from "@/lib/i18n/config";
import { useI18n } from "@/components/i18n/i18n-provider";

export function LocaleSwitcher() {
  const router = useRouter();
  const { locale, messages } = useI18n();
  const currentLocale = getLocaleMeta(locale);

  async function switchLocale(nextLocale: Locale) {
    try {
      const response = await fetch("/api/locale", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ locale: nextLocale }),
      });

      if (!response.ok) {
        return;
      }

      router.refresh();
    } catch {
      return;
    }
  }

  return (
    <div
      data-slot="locale-switcher"
      className="fixed top-4 right-4 z-50 max-w-[calc(100vw-2rem)] rounded-2xl border border-white/10 bg-black/45 px-3 py-3 shadow-2xl shadow-black/30 backdrop-blur-xl"
    >
      <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-zinc-400">
        <span>{messages.localeSwitcher.label}</span>
        <span aria-hidden="true">·</span>
        <span className="text-zinc-200">{currentLocale.nativeName}</span>
      </div>

      <div className="flex max-w-full flex-wrap items-center gap-2">
        {supportedLocales.map((entry) => {
          const active = entry.code === locale;

          return (
            <button
              key={entry.code}
              type="button"
              aria-label={messages.localeSwitcher.switchTo(entry.nativeName)}
              title={`${entry.nativeName} · ${entry.countryName}`}
              aria-pressed={active}
              onClick={() => void switchLocale(entry.code)}
              className={[
                "inline-flex items-center gap-2 rounded-full border px-2.5 py-1.5 text-xs transition-colors",
                active
                  ? "border-violet-400/40 bg-violet-500/15 text-violet-100"
                  : "border-white/10 bg-white/5 text-zinc-300 hover:border-white/20 hover:bg-white/10 hover:text-white",
              ].join(" ")}
            >
              <span aria-hidden="true" className="text-sm leading-none">{entry.flag}</span>
              <span className="hidden sm:inline">{entry.nativeName}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
