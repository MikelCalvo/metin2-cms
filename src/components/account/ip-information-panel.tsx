"use client";

import { useI18n } from "@/components/i18n/i18n-provider";
import { sanitizeOptionalDisplayText } from "@/lib/display-text";
import { formatFlaggedIp, formatIpGeoLocation } from "@/lib/ip-geo/presentation";
import type { IpGeoLookup } from "@/lib/ip-geo/types";

type IpInformationPanelProps = {
  ip: string | null;
  ipGeo?: IpGeoLookup | null;
};

export function IpInformationPanel({ ip, ipGeo = null }: IpInformationPanelProps) {
  const { locale, messages } = useI18n();
  const flaggedIp = formatFlaggedIp(ip, ipGeo?.countryCode);
  const locationLabel = formatIpGeoLocation(ipGeo, locale);
  const postalCode = sanitizeOptionalDisplayText(ipGeo?.postalCode);
  const timeZone = sanitizeOptionalDisplayText(ipGeo?.timeZone);
  const provider = sanitizeOptionalDisplayText(ipGeo?.isp);
  const source = sanitizeOptionalDisplayText(ipGeo?.source);

  if (!ip && !ipGeo) {
    return null;
  }

  return (
    <div className="space-y-3 rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-[0.72rem] uppercase tracking-[0.14em] text-zinc-500">{messages.common.ipInformation}</p>
      <dl className="grid gap-3 text-sm text-zinc-300 md:grid-cols-2">
        <div className="space-y-1">
          <dt className="text-xs uppercase tracking-[0.14em] text-zinc-500">{messages.common.ipAddress}</dt>
          <dd className="break-all text-zinc-100">{flaggedIp ?? messages.common.noValue}</dd>
        </div>
        <div className="space-y-1">
          <dt className="text-xs uppercase tracking-[0.14em] text-zinc-500">{messages.common.location}</dt>
          <dd className="text-zinc-100">{locationLabel ?? messages.common.noValue}</dd>
        </div>
        <div className="space-y-1">
          <dt className="text-xs uppercase tracking-[0.14em] text-zinc-500">{messages.common.postalCode}</dt>
          <dd className="text-zinc-100">{postalCode || messages.common.noValue}</dd>
        </div>
        <div className="space-y-1">
          <dt className="text-xs uppercase tracking-[0.14em] text-zinc-500">{messages.common.timeZone}</dt>
          <dd className="text-zinc-100">{timeZone || messages.common.noValue}</dd>
        </div>
        <div className="space-y-1">
          <dt className="text-xs uppercase tracking-[0.14em] text-zinc-500">{messages.common.provider}</dt>
          <dd className="text-zinc-100">{provider || messages.common.noValue}</dd>
        </div>
        <div className="space-y-1">
          <dt className="text-xs uppercase tracking-[0.14em] text-zinc-500">{messages.common.source}</dt>
          <dd className="text-zinc-100">{source || messages.common.noValue}</dd>
        </div>
      </dl>
    </div>
  );
}
