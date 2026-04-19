"use client";

import { ActivityIcon, AlertTriangleIcon, KeyRoundIcon, ShieldCheckIcon, UserIcon } from "lucide-react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatAccountEventTimestamp, summarizeUserAgent } from "@/lib/account-ui-formatters";
import { cn } from "@/lib/utils";
import type { AccountAuthActivityEntry } from "@/server/auth/auth-audit-service";

import { StatusChip } from "@/components/account/status-chip";
import { useI18n } from "@/components/i18n/i18n-provider";

function renderActivityIcon(entry: AccountAuthActivityEntry) {
  if (entry.eventType === "login" && entry.success) {
    return <ShieldCheckIcon className="size-4" />;
  }

  if (entry.eventType === "login" && !entry.success) {
    return <AlertTriangleIcon className="size-4" />;
  }

  if (
    entry.eventType.startsWith("password_recovery.") ||
    entry.eventType === "account.password_change"
  ) {
    return <KeyRoundIcon className="size-4" />;
  }

  if (entry.eventType === "account.profile_update") {
    return <UserIcon className="size-4" />;
  }

  return <ActivityIcon className="size-4" />;
}

export function ActivityRow({ entry }: { entry: AccountAuthActivityEntry }) {
  const { locale, messages } = useI18n();
  const deviceLabel = summarizeUserAgent(entry.userAgent, locale);

  return (
    <Card className="border-white/10 bg-white/[0.04] shadow-xl shadow-black/20 backdrop-blur-xl">
      <CardContent className="space-y-4 px-5 py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "mt-0.5 rounded-2xl border p-2.5",
                entry.success
                  ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                  : "border-amber-400/20 bg-amber-400/10 text-amber-200",
              )}
            >
              {renderActivityIcon(entry)}
            </div>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-base font-medium text-white">{entry.title}</p>
                <StatusChip tone={entry.success ? "success" : "attention"}>
                  {entry.success ? messages.common.success : messages.common.attention}
                </StatusChip>
              </div>
              <p className="max-w-2xl text-sm leading-6 text-zinc-400">{entry.description}</p>
            </div>
          </div>
          <p className="text-sm font-medium text-zinc-300">
            {formatAccountEventTimestamp(entry.occurredAt, new Date(), locale)}
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-white/8 bg-black/20 px-3 py-3">
            <p className="text-[0.72rem] uppercase tracking-[0.14em] text-zinc-500">{messages.common.device}</p>
            <p className="mt-1 text-sm font-medium text-zinc-100">{deviceLabel}</p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-black/20 px-3 py-3">
            <p className="text-[0.72rem] uppercase tracking-[0.14em] text-zinc-500">{messages.common.ipAddress}</p>
            <p className="mt-1 text-sm font-medium text-zinc-100">{entry.ip || messages.common.noValue}</p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-black/20 px-3 py-3">
            <p className="text-[0.72rem] uppercase tracking-[0.14em] text-zinc-500">{messages.common.outcome}</p>
            <p className="mt-1 text-sm font-medium text-zinc-100">{entry.outcomeLabel || entry.outcome}</p>
          </div>
        </div>

        <Separator className="bg-white/8" />

        <Accordion type="single" collapsible>
          <AccordionItem value={String(entry.id)} className="border-none">
            <AccordionTrigger className="py-0 text-sm text-zinc-300 hover:no-underline">
              {messages.common.rawEventDetails}
            </AccordionTrigger>
            <AccordionContent className="pt-3">
              <dl className="grid gap-3 text-sm text-zinc-300 md:grid-cols-2">
                <div className="space-y-1">
                  <dt className="text-xs uppercase tracking-[0.14em] text-zinc-500">{messages.common.userAgent}</dt>
                  <dd className="break-all text-zinc-100">{entry.userAgent || messages.common.noValue}</dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-xs uppercase tracking-[0.14em] text-zinc-500">{messages.common.delivery}</dt>
                  <dd className="text-zinc-100">
                    {entry.deliveryModeLabel ?? entry.deliveryMode ?? messages.common.noValue}
                  </dd>
                </div>
              </dl>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
