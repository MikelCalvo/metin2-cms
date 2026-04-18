import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PublicSectionProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

export function PublicSection({
  eyebrow,
  title,
  description,
  action,
  children,
  className,
  contentClassName,
}: PublicSectionProps) {
  return (
    <section
      className={cn(
        "rounded-[28px] border border-white/10 bg-white/[0.04] px-6 py-6 shadow-2xl shadow-black/20 backdrop-blur-xl sm:px-8 sm:py-8",
        className,
      )}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl space-y-2">
          {eyebrow ? (
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-zinc-500">{eyebrow}</p>
          ) : null}
          <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">{title}</h2>
          {description ? <p className="text-sm leading-6 text-zinc-400 sm:text-base">{description}</p> : null}
        </div>
        {action ? <div className="flex flex-wrap items-center gap-3">{action}</div> : null}
      </div>

      <div className={cn("mt-6", contentClassName)}>{children}</div>
    </section>
  );
}
