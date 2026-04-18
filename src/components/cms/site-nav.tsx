"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { siteNavigationItems, type SiteNavItem } from "@/components/cms/site-nav-items";
import { cn } from "@/lib/utils";

function isItemActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

type SiteNavProps = {
  items?: readonly SiteNavItem[];
  className?: string;
  linkClassName?: string;
};

export function SiteNav({
  items = siteNavigationItems,
  className,
  linkClassName,
}: SiteNavProps) {
  const pathname = usePathname() ?? "/";

  return (
    <nav className={cn("flex flex-wrap items-center gap-2", className)} aria-label="Primary">
      {items.map((item) => {
        const active = isItemActive(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm transition-colors",
              active
                ? "border-violet-400/30 bg-violet-500/10 text-violet-100"
                : "border-white/10 bg-white/5 text-zinc-300 hover:border-white/20 hover:bg-white/10 hover:text-white",
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
