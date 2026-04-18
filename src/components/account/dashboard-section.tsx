import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function DashboardSection({
  badge,
  title,
  description,
  action,
  children,
  className,
  contentClassName,
}: {
  badge?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <section className={cn("space-y-5", className)}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          {badge ? (
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-zinc-500">
              {badge}
            </p>
          ) : null}
          <div className="space-y-1">
            <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
              {title}
            </h2>
            {description ? (
              <p className="max-w-2xl text-sm leading-6 text-zinc-400">{description}</p>
            ) : null}
          </div>
        </div>
        {action ? <div className="flex items-center gap-2">{action}</div> : null}
      </div>
      <div className={contentClassName}>{children}</div>
    </section>
  );
}
