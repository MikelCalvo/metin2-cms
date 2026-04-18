import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const toneClasses = {
  neutral: "border-white/10 bg-white/5 text-zinc-200",
  success: "border-emerald-400/20 bg-emerald-400/12 text-emerald-200",
  attention: "border-amber-400/20 bg-amber-400/12 text-amber-200",
  current: "border-sky-400/20 bg-sky-400/12 text-sky-200",
} as const;

export function StatusChip({
  tone,
  children,
  icon,
  className,
}: {
  tone: keyof typeof toneClasses;
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "h-6 rounded-full px-2.5 text-[0.72rem] font-medium tracking-[0.01em]",
        toneClasses[tone],
        className,
      )}
    >
      {icon}
      {children}
    </Badge>
  );
}
