import Link from "next/link";
import {
  ArrowRightIcon,
  DownloadIcon,
  TrophyIcon,
  UserRoundPlusIcon,
} from "lucide-react";

import { PublicActionTile } from "@/components/cms/public-action-tile";
import { CmsPageHeader } from "@/components/cms/page-shell";
import { SitePageShell } from "@/components/cms/site-page-shell";
import { DownloadChecksumCopyButton } from "@/components/downloads/checksum-copy-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getIntlLocale, type Locale } from "@/lib/i18n/config";
import { getPublicEnv } from "@/lib/env";
import { getCurrentLocale, getMessagesForRequest } from "@/lib/i18n/server";
import { getStarterPackReleaseMetadata } from "@/server/downloads/starter-pack-metadata";

function formatReleaseSize(fileSizeBytes: number | null, locale: Locale) {
  if (fileSizeBytes === null) {
    return null;
  }

  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = fileSizeBytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  const formatter = new Intl.NumberFormat(getIntlLocale(locale), {
    maximumFractionDigits: value >= 100 || unitIndex === 0 ? 0 : 1,
  });

  return `${formatter.format(value)} ${units[unitIndex]}`;
}

function formatReleaseUpdatedAt(updatedAt: string | null, locale: Locale) {
  if (!updatedAt) {
    return null;
  }

  const parsed = new Date(updatedAt);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat(getIntlLocale(locale), {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed);
}

export default async function DownloadsPage() {
  const locale = await getCurrentLocale();
  const publicEnv = getPublicEnv();
  const starterPackUrl = publicEnv.STARTER_PACK_URL;
  const starterPackChecksum = publicEnv.STARTER_PACK_SHA256;
  const hasStarterPackDownload = Boolean(starterPackUrl);
  const messages = await getMessagesForRequest();
  const releaseMetadata = hasStarterPackDownload ? await getStarterPackReleaseMetadata() : null;
  const releaseSnapshotItems = releaseMetadata
    ? [
        {
          label: messages.downloads.releaseArchiveLabel,
          value: releaseMetadata.filename,
        },
        {
          label: messages.downloads.releaseBuildTagLabel,
          value: releaseMetadata.buildTag ?? messages.common.noValue,
        },
        {
          label: messages.downloads.releaseUpdatedLabel,
          value: formatReleaseUpdatedAt(releaseMetadata.updatedAt, locale) ?? messages.common.noValue,
        },
        {
          label: messages.downloads.releaseSizeLabel,
          value: formatReleaseSize(releaseMetadata.fileSizeBytes, locale) ?? messages.common.noValue,
        },
      ]
    : [];
  const nextRoutes = [
    {
      title: messages.downloads.routes.createAccountTitle,
      description: messages.downloads.routes.createAccountDescription,
      href: "/register",
      label: messages.common.createAccount,
      icon: <UserRoundPlusIcon className="size-4" />,
    },
    {
      title: messages.common.signIn,
      description: messages.downloads.routes.signInDescription,
      href: "/login",
      label: messages.common.signIn,
      icon: <ArrowRightIcon className="size-4" />,
    },
    {
      title: messages.downloads.routes.liveRankingsTitle,
      description: messages.downloads.routes.liveRankingsDescription,
      href: "/rankings",
      label: messages.common.viewRankings,
      icon: <TrophyIcon className="size-4" />,
    },
  ] as const;

  return (
    <SitePageShell>
      <CmsPageHeader
        eyebrow={messages.downloads.eyebrow}
        title={messages.downloads.title}
        description={messages.downloads.description}
      >
        <div data-slot="downloads-primary-actions" className="flex w-full flex-col gap-3 pt-2 sm:flex-row">
          {hasStarterPackDownload ? (
            <Button
              asChild
              size="lg"
              className="h-12 justify-between rounded-2xl bg-violet-500 px-5 text-base text-white shadow-lg shadow-violet-950/40 hover:bg-violet-400 sm:min-w-[240px]"
            >
              <Link href="/downloads/client">
                {messages.common.downloadLauncher}
                <DownloadIcon className="size-4" />
              </Link>
            </Button>
          ) : (
            <Button
              asChild
              size="lg"
              className="h-12 justify-between rounded-2xl bg-violet-500 px-5 text-base text-white shadow-lg shadow-violet-950/40 hover:bg-violet-400 sm:min-w-[240px]"
            >
              <Link href="/register">
                {messages.common.createAccount}
                <ArrowRightIcon className="size-4" />
              </Link>
            </Button>
          )}
          {!hasStarterPackDownload ? (
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 justify-between rounded-2xl border-white/10 bg-white/5 px-5 text-base text-zinc-100 hover:bg-white/10 sm:min-w-[220px]"
            >
              <Link href="/login">
                {messages.common.signIn}
                <ArrowRightIcon className="size-4" />
              </Link>
            </Button>
          ) : null}
        </div>

        <div className="site-pill rounded-full px-3 py-1.5">{messages.downloads.chipWindows}</div>
        <div className="site-pill rounded-full px-3 py-1.5">{messages.downloads.chipWine}</div>
        <div className="site-pill rounded-full px-3 py-1.5">{messages.downloads.chipBaseClient}</div>
        <div className="site-pill rounded-full px-3 py-1.5">{messages.downloads.chipResume}</div>
        {hasStarterPackDownload && starterPackChecksum ? (
          <DownloadChecksumCopyButton checksum={starterPackChecksum} />
        ) : null}
      </CmsPageHeader>

      {releaseMetadata ? (
        <Card className="site-surface rounded-[24px] bg-transparent py-0 shadow-none ring-0">
          <CardHeader className="space-y-3">
            <div className="site-inset flex size-10 items-center justify-center rounded-2xl text-violet-200">
              <DownloadIcon className="size-4" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-lg text-white">{messages.downloads.releaseSnapshotTitle}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {releaseSnapshotItems.map((item) => (
              <div key={item.label} className="site-inset rounded-2xl px-4 py-3">
                <p className="text-[0.72rem] uppercase tracking-[0.14em] text-zinc-500">{item.label}</p>
                <p className="mt-2 text-sm font-medium text-zinc-100">{item.value}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <Card className="site-surface rounded-[24px] bg-transparent py-0 shadow-none ring-0">
        <CardContent className="space-y-4 px-4 py-4">
          <p className="text-sm leading-6 text-zinc-400">
            {messages.downloads.nextIntro}
          </p>

          <div className="grid gap-4 md:grid-cols-3">
            {nextRoutes.map((route) => (
              <PublicActionTile
                key={route.href}
                href={route.href}
                title={route.title}
                description={route.description}
                label={route.label}
                icon={route.icon}
                dataSlot="next-route"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </SitePageShell>
  );
}
