import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type SummaryTone = "neutral" | "success" | "attention";

const valueToneClasses: Record<SummaryTone, string> = {
  neutral: "text-white",
  success: "text-emerald-200",
  attention: "text-amber-200",
};

export function SummaryCard({
  label,
  value,
  helper,
  tone,
  icon,
}: {
  label: string;
  value: string;
  helper: string;
  tone: SummaryTone;
  icon?: ReactNode;
}) {
  return (
    <Card className="border-white/10 bg-white/[0.04] shadow-2xl shadow-black/20 backdrop-blur-xl">
      <CardContent className="space-y-4 px-5 py-5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
            {label}
          </p>
          {icon ? (
            <div className="rounded-full border border-white/10 bg-white/5 p-2 text-zinc-300">
              {icon}
            </div>
          ) : null}
        </div>
        <div className="space-y-2">
          <p className={cn("text-xl font-semibold tracking-tight", valueToneClasses[tone])}>
            {value}
          </p>
          <p className="text-sm leading-6 text-zinc-400">{helper}</p>
        </div>
      </CardContent>
    </Card>
  );
}
