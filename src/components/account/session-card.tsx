"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  formatAccountEventTimestamp,
  formatSessionIdentifier,
  summarizeUserAgent,
} from "@/lib/account-ui-formatters";
import { formatFlaggedIp } from "@/lib/ip-geo/presentation";
import type { IpGeoLookup } from "@/lib/ip-geo/types";
import { cn } from "@/lib/utils";

import { revokeSessionAction } from "@/app/account/actions";
import { IpInformationPanel } from "@/components/account/ip-information-panel";
import { StatusChip } from "@/components/account/status-chip";
import { useI18n } from "@/components/i18n/i18n-provider";

type SessionCardProps = {
  session: {
    id: string;
    createdAt: string;
    lastSeenAt: string;
    ip: string | null;
    userAgent: string | null;
  };
  isCurrent: boolean;
  ipGeo?: IpGeoLookup | null;
};

export function SessionCard({ session, isCurrent, ipGeo = null }: SessionCardProps) {
  const { locale, messages } = useI18n();
  const deviceLabel = summarizeUserAgent(session.userAgent, locale);
  const shortId = formatSessionIdentifier(session.id);
  const ipLabel = formatFlaggedIp(session.ip, ipGeo?.countryCode);

  return (
    <Card
      className={cn(
        "site-surface rounded-[24px] bg-transparent py-0 shadow-none ring-0",
        isCurrent && "bg-white/[0.07]",
      )}
    >
      <CardContent className="space-y-4 px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-base font-medium text-white">{deviceLabel}</p>
              <StatusChip tone={isCurrent ? "current" : "neutral"}>
                {isCurrent ? messages.common.currentSession : messages.common.active}
              </StatusChip>
            </div>
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">{shortId}</p>
          </div>
          {!isCurrent ? (
            <form action={revokeSessionAction}>
              <input type="hidden" name="sessionId" value={session.id} />
              <Button
                type="submit"
                variant="outline"
                size="sm"
                className="border-white/10 bg-white/5 text-zinc-100 hover:bg-white/10"
              >
                {messages.common.revokeSession}
              </Button>
            </form>
          ) : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="site-inset rounded-2xl px-3 py-3">
            <p className="text-[0.72rem] uppercase tracking-[0.14em] text-zinc-500">{messages.common.lastSeen}</p>
            <p className="mt-1 text-sm font-medium text-zinc-100">
              {formatAccountEventTimestamp(session.lastSeenAt, new Date(), locale)}
            </p>
          </div>
          <div className="site-inset rounded-2xl px-3 py-3">
            <p className="text-[0.72rem] uppercase tracking-[0.14em] text-zinc-500">{messages.common.created}</p>
            <p className="mt-1 text-sm font-medium text-zinc-100">
              {formatAccountEventTimestamp(session.createdAt, new Date(), locale)}
            </p>
          </div>
          <div className="site-inset rounded-2xl px-3 py-3">
            <p className="text-[0.72rem] uppercase tracking-[0.14em] text-zinc-500">{messages.common.ipAddress}</p>
            <p className="mt-1 break-all text-sm font-medium text-zinc-100">{ipLabel || messages.common.noValue}</p>
          </div>
        </div>

        <Separator className="bg-white/8" />

        <Accordion type="single" collapsible>
          <AccordionItem value={session.id} className="border-none">
            <AccordionTrigger className="py-0 text-sm text-zinc-300 hover:no-underline">
              {messages.common.technicalDetails}
            </AccordionTrigger>
            <AccordionContent className="pt-3">
              <div className="space-y-4">
                <dl className="grid gap-3 text-sm text-zinc-300 md:grid-cols-2">
                  <div className="space-y-1">
                    <dt className="text-xs uppercase tracking-[0.14em] text-zinc-500">{messages.common.sessionId}</dt>
                    <dd className="break-all text-zinc-100">{session.id}</dd>
                  </div>
                  <div className="space-y-1">
                    <dt className="text-xs uppercase tracking-[0.14em] text-zinc-500">{messages.common.userAgent}</dt>
                    <dd className="break-all text-zinc-100">{session.userAgent || messages.common.noValue}</dd>
                  </div>
                </dl>
                <IpInformationPanel ip={session.ip} ipGeo={ipGeo} />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
