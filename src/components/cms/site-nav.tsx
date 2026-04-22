"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useI18n } from "@/components/i18n/i18n-provider";
import { cn } from "@/lib/utils";

function isItemActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

type SiteNavItem = {
  href: string;
  label: string;
};

type SiteNavProps = {
  items?: readonly SiteNavItem[];
  className?: string;
  linkClassName?: string;
  ariaLabel?: string;
};

export function SiteNav({
  items,
  className,
  linkClassName,
  ariaLabel,
}: SiteNavProps) {
  const pathname = usePathname() ?? "/";
  const { messages } = useI18n();
  const resolvedItems =
    items ??
    [
      { href: "/", label: messages.nav.home },
      { href: "/downloads", label: messages.nav.downloads },
      { href: "/rankings", label: messages.nav.rankings },
    ];

  return (
    <nav
      className={cn("flex flex-wrap items-center gap-2", className)}
      aria-label={ariaLabel ?? messages.nav.primary}
    >
      {resolvedItems.map((item) => {
        const active = isItemActive(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "site-pill rounded-full px-3 py-1.5 text-sm transition-colors",
              active
                ? "border-violet-400/30 bg-violet-500/12 text-violet-100 shadow-[0_0_0_1px_rgba(168,85,247,0.15)]"
                : "text-zinc-300 hover:border-white/20 hover:bg-white/10 hover:text-white",
              linkClassName,
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
