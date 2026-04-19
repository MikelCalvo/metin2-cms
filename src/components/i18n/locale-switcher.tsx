"use client";

import { ChevronDownIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useI18n } from "@/components/i18n/i18n-provider";
import {
  getLocaleMeta,
  supportedLocales,
  type Locale,
} from "@/lib/i18n/config";

export function LocaleSwitcher() {
  const { locale, messages } = useI18n();
  const currentLocale = getLocaleMeta(locale);
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current) {
        return;
      }

      const target = event.target;

      if (target instanceof Node && !rootRef.current.contains(target)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

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

      setIsOpen(false);

      if (typeof window !== "undefined") {
        window.location.reload();
      }
    } catch {
      return;
    }
  }

  return (
    <div ref={rootRef} data-slot="locale-switcher" className="relative z-50">
      <button
        type="button"
        data-slot="locale-switcher-trigger"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={messages.localeSwitcher.switchTo(currentLocale.nativeName)}
        onClick={() => setIsOpen((current) => !current)}
        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-zinc-100 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white"
      >
        <span aria-hidden="true" className="text-base leading-none">{currentLocale.flag}</span>
        <span className="hidden sm:inline">{currentLocale.nativeName}</span>
        <ChevronDownIcon className={`size-4 text-zinc-400 transition-transform ${isOpen ? "rotate-180" : "rotate-0"}`} />
      </button>

      <div
        data-slot="locale-switcher-dropdown"
        className={[
          "absolute top-[calc(100%+0.75rem)] right-0 z-50 min-w-[220px] rounded-2xl border border-white/10 bg-[#09090b]/95 p-2 shadow-2xl shadow-black/30 backdrop-blur-xl",
          isOpen ? "block" : "hidden",
        ].join(" ")}
      >
        <div className="px-2 py-2 text-[0.72rem] font-medium uppercase tracking-[0.18em] text-zinc-500">
          {messages.localeSwitcher.label}
        </div>
        <div className="space-y-1">
          {supportedLocales.map((entry) => {
            const active = entry.code === locale;

            return (
              <button
                key={entry.code}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                aria-label={messages.localeSwitcher.switchTo(entry.nativeName)}
                title={`${entry.nativeName} · ${entry.countryName}`}
                onClick={() => void switchLocale(entry.code)}
                className={[
                  "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors",
                  active
                    ? "bg-violet-500/15 text-violet-100"
                    : "text-zinc-300 hover:bg-white/5 hover:text-white",
                ].join(" ")}
              >
                <span className="flex items-center gap-3">
                  <span aria-hidden="true" className="text-base leading-none">{entry.flag}</span>
                  <span>{entry.nativeName}</span>
                </span>
                <span className="text-xs text-zinc-500">{entry.code.toUpperCase()}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
