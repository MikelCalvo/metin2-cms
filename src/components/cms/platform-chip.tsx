import type { ComponentPropsWithoutRef } from "react";

import { WineIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type PlatformChipProps = {
  platform: "windows" | "linux";
  label: string;
  note?: string;
  className?: string;
};

function WindowsLogoIcon(props: ComponentPropsWithoutRef<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <rect x="3" y="4" width="8" height="7" rx="1.5" fill="currentColor" />
      <rect x="13" y="4" width="8" height="7" rx="1.5" fill="currentColor" />
      <rect x="3" y="13" width="8" height="7" rx="1.5" fill="currentColor" />
      <rect x="13" y="13" width="8" height="7" rx="1.5" fill="currentColor" />
    </svg>
  );
}

function PenguinLogoIcon(props: ComponentPropsWithoutRef<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 3.5c-2.3 0-4 1.8-4 4.1 0 1 .3 1.8.8 2.4-1.8 1.2-2.8 3.2-2.8 5.6 0 3.5 2.5 6.4 6 6.4s6-2.9 6-6.4c0-2.4-1-4.4-2.8-5.6.5-.6.8-1.4.8-2.4 0-2.3-1.7-4.1-4-4.1Z"
        fill="currentColor"
        opacity="0.92"
      />
      <ellipse cx="12" cy="14.5" rx="2.7" ry="4.7" fill="#09090b" opacity="0.9" />
      <circle cx="10.3" cy="7.8" r="0.7" fill="#09090b" />
      <circle cx="13.7" cy="7.8" r="0.7" fill="#09090b" />
      <path d="M12 9.1l1.1 1.2h-2.2L12 9.1Z" fill="#f59e0b" />
      <path d="M9.6 21.2 8 22.4m6.4-1.2 1.6 1.2" stroke="#f59e0b" strokeLinecap="round" strokeWidth="1.6" />
    </svg>
  );
}

const platformIcons = {
  windows: WindowsLogoIcon,
  linux: PenguinLogoIcon,
} as const;

export function PlatformChip({ platform, label, note, className }: PlatformChipProps) {
  const Icon = platformIcons[platform];

  return (
    <div
      data-slot="platform-chip"
      data-platform-chip={platform}
      className={cn(
        "site-pill inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-zinc-100",
        className,
      )}
    >
      <Icon className="size-4 shrink-0 text-zinc-200" />
      <span>{label}</span>
      {note ? (
        <>
          <span aria-hidden="true" className="text-zinc-500">
            •
          </span>
          <span className="inline-flex items-center gap-1.5 text-zinc-300">
            <WineIcon className="size-3.5" aria-hidden="true" />
            {note}
          </span>
        </>
      ) : null}
    </div>
  );
}
