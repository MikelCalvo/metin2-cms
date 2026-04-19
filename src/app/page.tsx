import Link from "next/link";
import { ArrowRightIcon, DownloadIcon, TrophyIcon, UserRoundPlusIcon } from "lucide-react";

import { CmsPageHeader } from "@/components/cms/page-shell";
import { PublicSection } from "@/components/cms/public-section";
import { SitePageShell } from "@/components/cms/site-page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getMessagesForRequest } from "@/lib/i18n/server";

export default async function Home() {
  const messages = await getMessagesForRequest();
  const quickRoutes = [
    {
      title: messages.home.routes.playNowTitle,
      description: messages.home.routes.playNowDescription,
      href: "/downloads",
      label: messages.home.routes.playNowLabel,
      icon: <DownloadIcon className="size-4" />,
    },
    {
      title: messages.home.routes.createAccountTitle,
      description: messages.home.routes.createAccountDescription,
      href: "/register",
      label: messages.common.createAccount,
      icon: <UserRoundPlusIcon className="size-4" />,
    },
    {
      title: messages.home.routes.rankingsTitle,
      description: messages.home.routes.rankingsDescription,
      href: "/rankings",
      label: messages.home.routes.rankingsLabel,
      icon: <TrophyIcon className="size-4" />,
    },
  ] as const;

  return (
    <SitePageShell>
      <CmsPageHeader
        title={
          <>
            <span className="block">{messages.home.heroLineOne}</span>
            <span className="block">{messages.home.heroLineTwo}</span>
          </>
        }
        description={messages.home.description}
      >
        <div className="flex w-full flex-col gap-3 pt-2 sm:flex-row">
          <Link
            href="/downloads"
            className="group inline-flex items-center justify-between gap-4 rounded-2xl border border-white/12 bg-white/[0.08] px-4 py-3 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/[0.12]"
          >
            <span className="flex items-center gap-3">
              <DownloadIcon className="size-4 text-zinc-200" />
              {messages.common.downloadLauncher}
            </span>
            <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>

          <Link
            href="/register"
            className="group inline-flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-medium text-zinc-100 transition hover:border-white/20 hover:bg-white/[0.06]"
          >
            <span className="flex items-center gap-3">
              <UserRoundPlusIcon className="size-4 text-zinc-300" />
              {messages.common.createAccount}
            </span>
            <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">{messages.home.chipWindows}</div>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">{messages.home.chipWine}</div>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">{messages.home.chipLauncher}</div>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">{messages.home.chipRankings}</div>
      </CmsPageHeader>

      <PublicSection
        eyebrow={messages.home.sectionEyebrow}
        title={messages.home.sectionTitle}
        description={messages.home.sectionDescription}
      >
        <div className="grid gap-4 md:grid-cols-3">
          {quickRoutes.map((route) => (
            <Card key={route.href} className="border-white/10 bg-black/20 shadow-none">
              <CardHeader className="space-y-3">
                <div className="flex size-10 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-violet-200">
                  {route.icon}
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-lg text-white">{route.title}</CardTitle>
                  <CardDescription className="text-sm leading-6 text-zinc-400">{route.description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  asChild
                  variant="ghost"
                  className="px-0 text-zinc-300 hover:bg-transparent hover:text-white"
                >
                  <Link href={route.href}>
                    {route.label}
                    <ArrowRightIcon className="size-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </PublicSection>
    </SitePageShell>
  );
}
