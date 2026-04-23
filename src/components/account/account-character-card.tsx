import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { sanitizeDisplayText, sanitizeOptionalDisplayText } from "@/lib/display-text";
import { getIntlLocale, type Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { formatPlaytimeDuration, formatRankingTimestamp } from "@/server/rankings/rankings-formatters";

import type { AccountCharacter } from "@/server/account/account-characters-types";

function formatInteger(value: number, locale: Locale) {
  return new Intl.NumberFormat(getIntlLocale(locale)).format(value);
}

export function AccountCharacterCard({
  character,
  locale,
}: {
  character: AccountCharacter;
  locale: Locale;
}) {
  const messages = getMessages(locale);
  const safeCharacterName = sanitizeDisplayText(character.name);
  const safeCharacterClassLabel = sanitizeDisplayText(character.classLabel);
  const safeCharacterGuildName = sanitizeOptionalDisplayText(character.guildName);

  return (
    <Card
      data-slot="account-character-card"
      className="site-surface rounded-[24px] bg-transparent py-0 shadow-none ring-0"
    >
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl text-white">
          <Link href={`/characters/${character.id}`} className="transition-colors hover:text-violet-200">
            {safeCharacterName}
          </Link>
        </CardTitle>
        <CardDescription className="text-sm leading-6 text-zinc-400">
          {safeCharacterClassLabel}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        <div className="site-inset rounded-2xl px-4 py-3">
          <p className="text-[0.72rem] uppercase tracking-[0.14em] text-zinc-500">
            {messages.rankings.columns.level}
          </p>
          <p className="mt-1 text-sm font-medium text-zinc-100">
            {formatInteger(character.level, locale)}
          </p>
        </div>
        <div className="site-inset rounded-2xl px-4 py-3">
          <p className="text-[0.72rem] uppercase tracking-[0.14em] text-zinc-500">
            {messages.rankings.columns.playtime}
          </p>
          <p className="mt-1 text-sm font-medium text-zinc-100">
            {formatPlaytimeDuration(character.playtime, locale)}
          </p>
        </div>
        <div className="site-inset rounded-2xl px-4 py-3">
          <p className="text-[0.72rem] uppercase tracking-[0.14em] text-zinc-500">
            {messages.rankings.columns.guild}
          </p>
          <p className="mt-1 text-sm font-medium text-zinc-100">
            {safeCharacterGuildName || messages.common.noValue}
          </p>
        </div>
        <div className="site-inset rounded-2xl px-4 py-3">
          <p className="text-[0.72rem] uppercase tracking-[0.14em] text-zinc-500">
            {messages.rankings.columns.lastSeen}
          </p>
          <p className="mt-1 text-sm font-medium text-zinc-100">
            {formatRankingTimestamp(character.lastPlay, new Date(), locale)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
