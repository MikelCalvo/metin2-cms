import Link from "next/link";
import { DownloadIcon, ShieldAlertIcon, TrophyIcon } from "lucide-react";
import { notFound } from "next/navigation";

import { CmsPageHeader } from "@/components/cms/page-shell";
import { PublicSection } from "@/components/cms/public-section";
import { SitePageShell } from "@/components/cms/site-page-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { getIntlLocale } from "@/lib/i18n/config";
import { getCurrentLocale, getMessagesForRequest } from "@/lib/i18n/server";
import { getCharacterDetail } from "@/server/characters/character-detail-service";
import { formatRankingTimestamp } from "@/server/rankings/rankings-formatters";

export const dynamic = "force-dynamic";

type CharacterPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function parseCharacterId(rawValue: string) {
  const parsed = Number.parseInt(rawValue, 10);

  if (!Number.isSafeInteger(parsed) || parsed < 1) {
    return null;
  }

  return parsed;
}

function formatInteger(value: number, locale: string) {
  return new Intl.NumberFormat(locale).format(value);
}

function formatPlaytimeMinutes(value: number, locale: string) {
  const numberFormat = new Intl.NumberFormat(locale);
  const hours = Math.floor(value / 60);
  const minutes = value % 60;

  if (hours > 0 && minutes > 0) {
    return `${numberFormat.format(hours)}h ${numberFormat.format(minutes)}m`;
  }

  if (hours > 0) {
    return `${numberFormat.format(hours)}h`;
  }

  return `${numberFormat.format(minutes)}m`;
}

function formatPosition(x: number, y: number, locale: string) {
  const numberFormat = new Intl.NumberFormat(locale);
  return `${numberFormat.format(x)}, ${numberFormat.format(y)}`;
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-black/20 px-4 py-4">
      <p className="text-[0.72rem] uppercase tracking-[0.14em] text-zinc-500">{label}</p>
      <p className="mt-2 text-base font-semibold tracking-tight text-white">{value}</p>
    </div>
  );
}

export default async function CharacterDetailPage({ params }: CharacterPageProps) {
  const locale = await getCurrentLocale();
  const intlLocale = getIntlLocale(locale);
  const messages = await getMessagesForRequest();
  const resolvedParams = await params;
  const parsedCharacterId = parseCharacterId(resolvedParams.id);

  if (parsedCharacterId === null) {
    notFound();
  }

  const characterDetail = await getCharacterDetail(parsedCharacterId, locale);

  if (characterDetail.status === "not_found") {
    notFound();
  }

  if (characterDetail.status === "unavailable") {
    return (
      <SitePageShell>
        <PublicSection
          eyebrow={messages.characterDetail.eyebrow}
          title={messages.characterDetail.unavailableTitle}
          description={messages.characterDetail.unavailableDescription}
        >
          <Alert className="border-white/10 bg-black/20 text-zinc-100">
            <ShieldAlertIcon className="size-4" />
            <AlertTitle>{messages.characterDetail.unavailableAlertTitle}</AlertTitle>
            <AlertDescription className="text-zinc-400">{characterDetail.message}</AlertDescription>
          </Alert>
        </PublicSection>
      </SitePageShell>
    );
  }

  const { character } = characterDetail;
  const progressionMetrics = [
    { label: messages.rankings.columns.level, value: formatInteger(character.level, intlLocale) },
    { label: messages.rankings.columns.exp, value: formatInteger(character.exp, intlLocale) },
    { label: messages.rankings.columns.playtime, value: formatPlaytimeMinutes(character.playtime, intlLocale) },
    { label: messages.characterDetail.fields.yang, value: formatInteger(character.gold, intlLocale) },
    { label: messages.characterDetail.fields.alignment, value: formatInteger(character.alignment, intlLocale) },
  ] as const;
  const combatMetrics = [
    { label: messages.characterDetail.fields.hp, value: formatInteger(character.hp, intlLocale) },
    { label: messages.characterDetail.fields.mp, value: formatInteger(character.mp, intlLocale) },
    { label: messages.characterDetail.fields.st, value: formatInteger(character.st, intlLocale) },
    { label: messages.characterDetail.fields.ht, value: formatInteger(character.ht, intlLocale) },
    { label: messages.characterDetail.fields.dx, value: formatInteger(character.dx, intlLocale) },
    { label: messages.characterDetail.fields.iq, value: formatInteger(character.iq, intlLocale) },
  ] as const;
  const worldMetrics = [
    { label: messages.characterDetail.fields.map, value: formatInteger(character.mapIndex, intlLocale) },
    { label: messages.characterDetail.fields.position, value: formatPosition(character.x, character.y, intlLocale) },
    {
      label: messages.rankings.columns.lastSeen,
      value: formatRankingTimestamp(character.lastPlay, new Date(), locale),
    },
  ] as const;
  const guildMetrics = [
    { label: messages.rankings.columns.guild, value: character.guildName || messages.common.noValue },
    {
      label: messages.characterDetail.fields.guildRole,
      value: character.guildRoleLabel || messages.common.noValue,
    },
  ] as const;
  const mountMetrics = [
    {
      label: messages.characterDetail.fields.skillGroup,
      value: character.skillGroupLabel,
    },
    {
      label: messages.characterDetail.fields.skillPoints,
      value: formatInteger(character.skillPoint, intlLocale),
    },
    {
      label: messages.characterDetail.fields.subSkillPoints,
      value: formatInteger(character.subSkillPoint, intlLocale),
    },
    {
      label: messages.characterDetail.fields.statPoints,
      value: formatInteger(character.statPoint, intlLocale),
    },
    {
      label: messages.characterDetail.fields.horseLevel,
      value: formatInteger(character.horseLevel, intlLocale),
    },
    {
      label: messages.characterDetail.fields.horseHp,
      value: formatInteger(character.horseHp, intlLocale),
    },
    {
      label: messages.characterDetail.fields.horseStamina,
      value: formatInteger(character.horseStamina, intlLocale),
    },
    {
      label: messages.characterDetail.fields.statResets,
      value: formatInteger(character.statResetCount, intlLocale),
    },
  ] as const;

  return (
    <SitePageShell>
      <CmsPageHeader
        eyebrow={messages.characterDetail.eyebrow}
        title={character.name}
        description={messages.characterDetail.heroDescription}
        actions={
          <>
            <Button
              asChild
              size="lg"
              className="h-11 justify-between rounded-2xl bg-violet-500 px-5 text-white hover:bg-violet-400"
            >
              <Link href="/rankings">
                {messages.common.viewRankings}
                <TrophyIcon className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-11 justify-between rounded-2xl border-white/10 bg-white/5 px-5 text-zinc-100 hover:bg-white/10"
            >
              <Link href="/downloads">
                {messages.common.openDownloads}
                <DownloadIcon className="size-4" />
              </Link>
            </Button>
          </>
        }
      >
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
          {character.classLabel}
        </div>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
          {messages.rankings.columns.level}: {formatInteger(character.level, intlLocale)}
        </div>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
          {messages.rankings.columns.guild}: {character.guildName || messages.common.noValue}
        </div>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
          {messages.rankings.columns.lastSeen}: {formatRankingTimestamp(character.lastPlay, new Date(), locale)}
        </div>
      </CmsPageHeader>

      <PublicSection
        eyebrow={messages.characterDetail.progressionEyebrow}
        title={messages.characterDetail.progressionTitle}
        description={messages.characterDetail.progressionDescription}
        contentClassName="grid gap-4 md:grid-cols-2 xl:grid-cols-5"
      >
        {progressionMetrics.map((metric) => (
          <MetricCard key={metric.label} label={metric.label} value={metric.value} />
        ))}
      </PublicSection>

      <PublicSection
        eyebrow={messages.characterDetail.combatEyebrow}
        title={messages.characterDetail.combatTitle}
        description={messages.characterDetail.combatDescription}
        contentClassName="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
      >
        {combatMetrics.map((metric) => (
          <MetricCard key={metric.label} label={metric.label} value={metric.value} />
        ))}
      </PublicSection>

      <PublicSection
        eyebrow={messages.characterDetail.worldEyebrow}
        title={messages.characterDetail.worldTitle}
        description={messages.characterDetail.worldDescription}
        contentClassName="grid gap-4 md:grid-cols-3"
      >
        {worldMetrics.map((metric) => (
          <MetricCard key={metric.label} label={metric.label} value={metric.value} />
        ))}
      </PublicSection>

      <PublicSection
        eyebrow={messages.characterDetail.guildEyebrow}
        title={messages.characterDetail.guildTitle}
        description={messages.characterDetail.guildDescription}
        contentClassName="grid gap-4 md:grid-cols-2"
      >
        {guildMetrics.map((metric) => (
          <MetricCard key={metric.label} label={metric.label} value={metric.value} />
        ))}
      </PublicSection>

      <PublicSection
        eyebrow={messages.characterDetail.mountEyebrow}
        title={messages.characterDetail.mountTitle}
        description={messages.characterDetail.mountDescription}
        contentClassName="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
      >
        {mountMetrics.map((metric) => (
          <MetricCard key={metric.label} label={metric.label} value={metric.value} />
        ))}
      </PublicSection>

      <PublicSection
        eyebrow={messages.characterDetail.nextEyebrow}
        title={messages.characterDetail.nextTitle}
        description={messages.characterDetail.nextDescription}
        contentClassName="grid gap-4 md:grid-cols-2"
      >
        <Link
          href="/rankings"
          className="group flex items-center gap-4 rounded-[24px] border border-white/10 bg-black/20 px-5 py-5 text-left transition duration-200 hover:border-white/20 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-violet-200">
            <TrophyIcon className="size-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-medium text-white">{messages.characterDetail.routes.rankingsTitle}</span>
            <span className="block text-sm leading-6 text-zinc-400 group-hover:text-zinc-300">
              {messages.characterDetail.routes.rankingsDescription}
            </span>
          </span>
        </Link>
        <Link
          href="/downloads"
          className="group flex items-center gap-4 rounded-[24px] border border-white/10 bg-black/20 px-5 py-5 text-left transition duration-200 hover:border-white/20 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-violet-200">
            <DownloadIcon className="size-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-medium text-white">{messages.characterDetail.routes.downloadsTitle}</span>
            <span className="block text-sm leading-6 text-zinc-400 group-hover:text-zinc-300">
              {messages.characterDetail.routes.downloadsDescription}
            </span>
          </span>
        </Link>
      </PublicSection>
    </SitePageShell>
  );
}
