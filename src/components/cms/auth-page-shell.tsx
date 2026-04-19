"use client";

import type { ReactNode } from "react";

import { useI18n } from "@/components/i18n/i18n-provider";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CmsPageHeader, CmsPageShell } from "@/components/cms/page-shell";

export type AuthSupportItem = {
  title: string;
  description: string;
  icon?: ReactNode;
};

type AuthPageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  supportEyebrow?: string;
  supportTitle: string;
  supportDescription?: string;
  supportItems: AuthSupportItem[];
  footer?: ReactNode;
  children: ReactNode;
};

export function AuthPageShell({
  eyebrow,
  title,
  description,
  supportEyebrow = "CMS security",
  supportTitle,
  supportDescription,
  supportItems,
  footer,
  children,
}: AuthPageShellProps) {
  const { messages } = useI18n();

  return (
    <CmsPageShell containerClassName="justify-center">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(420px,0.85fr)] xl:items-stretch">
        <Card className="flex h-full border-white/10 bg-white/[0.04] shadow-2xl shadow-black/30 backdrop-blur-xl">
          <div className="flex h-full flex-col gap-8 p-6 sm:p-8">
            <CmsPageHeader
              eyebrow={eyebrow}
              title={title}
              description={description}
              className="border-none bg-transparent p-0 shadow-none"
            >
              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                {messages.authShell.compatibilityChip}
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                {messages.authShell.secureSessionsChip}
              </div>
            </CmsPageHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-[0.22em] text-zinc-500">
                  {supportEyebrow}
                </p>
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold tracking-tight text-white">
                    {supportTitle}
                  </h2>
                  {supportDescription ? (
                    <p className="max-w-2xl text-sm leading-6 text-zinc-400">
                      {supportDescription}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {supportItems.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-3xl border border-white/10 bg-black/20 px-4 py-4"
                  >
                    <div className="flex items-start gap-3">
                      {item.icon ? (
                        <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-violet-200">
                          {item.icon}
                        </div>
                      ) : null}
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-medium text-white">{item.title}</p>
                          <Badge
                            variant="secondary"
                            className="border border-white/10 bg-white/5 text-zinc-300"
                          >
                            {messages.authShell.ready}
                          </Badge>
                        </div>
                        <p className="text-sm leading-6 text-zinc-400">{item.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {footer ? (
              <div className="mt-auto rounded-3xl border border-white/10 bg-black/20 px-4 py-4 text-sm text-zinc-400">
                {footer}
              </div>
            ) : null}
          </div>
        </Card>

        <div className="flex items-center">{children}</div>
      </div>
    </CmsPageShell>
  );
}
