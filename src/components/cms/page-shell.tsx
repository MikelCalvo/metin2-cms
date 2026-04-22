import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type CmsPageShellProps = {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
};

export function CmsPageShell({
  children,
  className,
  containerClassName,
}: CmsPageShellProps) {
  return (
    <main
      className={cn(
        "min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(139,92,246,0.15),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.12),_transparent_28%),linear-gradient(180deg,_#08080b_0%,_#0f172a_55%,_#09090b_100%)] text-zinc-100",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:72px_72px] opacity-[0.08]" />
      <div
        className={cn(
          "relative mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-7 px-4 py-6 sm:gap-8 sm:px-6 sm:py-8 lg:gap-10 lg:px-10 lg:py-10",
          containerClassName,
        )}
      >
        {children}
      </div>
    </main>
  );
}

type CmsPageHeaderProps = {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
};

export function CmsPageHeader({
  eyebrow,
  title,
  description,
  actions,
  children,
  className,
}: CmsPageHeaderProps) {
  return (
    <section
      className={cn(
        "site-surface overflow-hidden rounded-[30px] shadow-2xl shadow-black/30 backdrop-blur-xl",
        className,
      )}
    >
      <div className="flex flex-col gap-5 px-5 py-6 sm:px-6 sm:py-7 lg:flex-row lg:items-end lg:justify-between lg:px-8 lg:py-8">
        <div className="max-w-3xl space-y-2.5">
          {eyebrow ? (
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-zinc-500">
              {eyebrow}
            </p>
          ) : null}
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
              {title}
            </h1>
            {description ? (
              <p className="max-w-2xl text-sm leading-6 text-zinc-300">
                {description}
              </p>
            ) : null}
          </div>
          {children ? <div className="flex flex-wrap gap-2.5 text-sm text-zinc-400">{children}</div> : null}
        </div>
        {actions ? (
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center [&>*]:w-full sm:[&>*]:w-auto">
            {actions}
          </div>
        ) : null}
      </div>
    </section>
  );
}
