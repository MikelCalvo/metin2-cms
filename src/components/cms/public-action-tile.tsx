import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PublicActionTileProps = {
  href: string;
  title: string;
  description: string;
  label: string;
  icon: ReactNode;
  dataSlot?: string;
  className?: string;
};

export function PublicActionTile({
  href,
  title,
  description,
  label,
  icon,
  dataSlot,
  className,
}: PublicActionTileProps) {
  return (
    <Link
      href={href}
      data-slot={dataSlot}
      data-action-tile="true"
      className={cn(
        "site-action-tile group flex h-full flex-col justify-between gap-6 rounded-[24px] p-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60",
        className,
      )}
    >
      <div className="space-y-4">
        <div className="site-inset flex size-10 items-center justify-center rounded-2xl text-violet-100 transition-colors group-hover:border-violet-300/30 group-hover:bg-violet-500/18 group-hover:text-white">
          {icon}
        </div>
        <div className="space-y-2">
          <div className="text-lg font-medium text-white">{title}</div>
          <div className="text-sm leading-6 text-zinc-400 group-hover:text-zinc-300">{description}</div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 text-sm text-zinc-300 transition-colors group-hover:text-white">
        <span>{label}</span>
        <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
