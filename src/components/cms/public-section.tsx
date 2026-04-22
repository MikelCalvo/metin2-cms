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
        "site-surface rounded-[24px] px-5 py-5 shadow-2xl shadow-black/20 backdrop-blur-xl sm:px-6 sm:py-6",
        className,
      )}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl space-y-1.5">
          {eyebrow ? (
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-zinc-500">{eyebrow}</p>
          ) : null}
          <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">{title}</h2>
          {description ? <p className="text-sm leading-6 text-zinc-400">{description}</p> : null}
        </div>
        {action ? (
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center [&>*]:w-full sm:[&>*]:w-auto">
            {action}
          </div>
        ) : null}
      </div>

      <div className={cn("mt-5", contentClassName)}>{children}</div>
    </section>
  );
}
