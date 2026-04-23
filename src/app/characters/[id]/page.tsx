import Link from "next/link";
import { DownloadIcon, ShieldAlertIcon, TrophyIcon } from "lucide-react";
import { notFound } from "next/navigation";

import { PublicActionTile } from "@/components/cms/public-action-tile";
import { CmsPageHeader } from "@/components/cms/page-shell";
import { PublicSection } from "@/components/cms/public-section";
import { SitePageShell } from "@/components/cms/site-page-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { sanitizeDisplayText, sanitizeOptionalDisplayText } from "@/lib/display-text";
import { getIntlLocale } from "@/lib/i18n/config";
import { getCurrentLocale, getMessagesForRequest } from "@/lib/i18n/server";
import { getCharacterDetail } from "@/server/characters/character-detail-service";
import { formatPlaytimeDuration, formatRankingTimestamp } from "@/server/rankings/rankings-formatters";

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

function formatPosition(x: number, y: number, locale: string) {
  const numberFormat = new Intl.NumberFormat(locale);
  return `${numberFormat.format(x)}, ${numberFormat.format(y)}`;
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="site-inset rounded-[24px] px-4 py-4">
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
  const safeCharacterName = sanitizeDisplayText(character.name);
  const safeCharacterClassLabel = sanitizeDisplayText(character.classLabel);
  const safeCharacterGuildName = sanitizeOptionalDisplayText(character.guildName);
  const safeCharacterGuildRoleLabel = sanitizeOptionalDisplayText(character.guildRoleLabel);
  const safeCharacterSkillGroupLabel = sanitizeDisplayText(character.skillGroupLabel);
  const progressionMetrics = [
    { label: messages.rankings.columns.level, value: formatInteger(character.level, intlLocale) },
    { label: messages.rankings.columns.exp, value: formatInteger(character.exp, intlLocale) },
    { label: messages.rankings.columns.playtime, value: formatPlaytimeDuration(character.playtime, intlLocale) },
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
    { label: messages.rankings.columns.guild, value: safeCharacterGuildName || messages.common.noValue },
    {
      label: messages.characterDetail.fields.guildRole,
      value: safeCharacterGuildRoleLabel || messages.common.noValue,
    },
  ] as const;
  const mountMetrics = [
    {
      label: messages.characterDetail.fields.skillGroup,
      value: safeCharacterSkillGroupLabel,
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
        title={safeCharacterName}
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
        <div className="site-pill rounded-full px-3 py-1.5">
          {safeCharacterClassLabel}
        </div>
        <div className="site-pill rounded-full px-3 py-1.5">
          {messages.rankings.columns.level}: {formatInteger(character.level, intlLocale)}
        </div>
        <div className="site-pill rounded-full px-3 py-1.5">
          {messages.rankings.columns.guild}: {safeCharacterGuildName || messages.common.noValue}
        </div>
        <div className="site-pill rounded-full px-3 py-1.5">
          {messages.rankings.columns.lastSeen}: {formatRankingTimestamp(character.lastPlay, new Date(), locale)}
        </div>
      </CmsPageHeader>

      <PublicSection
        eyebrow={messages.characterDetail.progressionEyebrow}
        title={messages.characterDetail.progressionTitle}
        contentClassName="grid gap-4 md:grid-cols-2 xl:grid-cols-5"
      >
        {progressionMetrics.map((metric) => (
          <MetricCard key={metric.label} label={metric.label} value={metric.value} />
        ))}
      </PublicSection>

      <PublicSection
        eyebrow={messages.characterDetail.combatEyebrow}
        title={messages.characterDetail.combatTitle}
        contentClassName="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
      >
        {combatMetrics.map((metric) => (
          <MetricCard key={metric.label} label={metric.label} value={metric.value} />
        ))}
      </PublicSection>

      <PublicSection
        eyebrow={messages.characterDetail.worldEyebrow}
        title={messages.characterDetail.worldTitle}
        contentClassName="grid gap-4 md:grid-cols-3"
      >
        {worldMetrics.map((metric) => (
          <MetricCard key={metric.label} label={metric.label} value={metric.value} />
        ))}
      </PublicSection>

      <PublicSection
        eyebrow={messages.characterDetail.guildEyebrow}
        title={messages.characterDetail.guildTitle}
        contentClassName="grid gap-4 md:grid-cols-2"
      >
        {guildMetrics.map((metric) => (
          <MetricCard key={metric.label} label={metric.label} value={metric.value} />
        ))}
      </PublicSection>

      <PublicSection
        eyebrow={messages.characterDetail.mountEyebrow}
        title={messages.characterDetail.mountTitle}
        contentClassName="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
      >
        {mountMetrics.map((metric) => (
          <MetricCard key={metric.label} label={metric.label} value={metric.value} />
        ))}
      </PublicSection>

      <PublicSection
        eyebrow={messages.characterDetail.nextEyebrow}
        title={messages.characterDetail.nextTitle}
        contentClassName="grid gap-4 md:grid-cols-2"
      >
        <PublicActionTile
          href="/rankings"
          title={messages.characterDetail.routes.rankingsTitle}
          description={messages.characterDetail.routes.rankingsDescription}
          label={messages.common.viewRankings}
          icon={<TrophyIcon className="size-4" />}
        />
        <PublicActionTile
          href="/downloads"
          title={messages.characterDetail.routes.downloadsTitle}
          description={messages.characterDetail.routes.downloadsDescription}
          label={messages.common.openDownloads}
          icon={<DownloadIcon className="size-4" />}
        />
      </PublicSection>
    </SitePageShell>
  );
}
