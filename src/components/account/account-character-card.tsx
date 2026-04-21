import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getIntlLocale, type Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { formatRankingTimestamp } from "@/server/rankings/rankings-formatters";

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

  return (
    <Card
      data-slot="account-character-card"
      className="border-white/10 bg-white/[0.04] shadow-2xl shadow-black/20 backdrop-blur-xl"
    >
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl text-white">{character.name}</CardTitle>
        <CardDescription className="text-sm leading-6 text-zinc-400">
          {character.classLabel}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
          <p className="text-[0.72rem] uppercase tracking-[0.14em] text-zinc-500">
            {messages.rankings.columns.level}
          </p>
          <p className="mt-1 text-sm font-medium text-zinc-100">
            {formatInteger(character.level, locale)}
          </p>
        </div>
        <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
          <p className="text-[0.72rem] uppercase tracking-[0.14em] text-zinc-500">
            {messages.rankings.columns.playtime}
          </p>
          <p className="mt-1 text-sm font-medium text-zinc-100">
            {formatInteger(character.playtime, locale)}
          </p>
        </div>
        <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
          <p className="text-[0.72rem] uppercase tracking-[0.14em] text-zinc-500">
            {messages.rankings.columns.guild}
          </p>
          <p className="mt-1 text-sm font-medium text-zinc-100">
            {character.guildName || messages.common.noValue}
          </p>
        </div>
        <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
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
