import Link from "next/link";
import { AlertTriangleIcon, KeyRoundIcon, ShieldCheckIcon, ShieldIcon } from "lucide-react";
import { redirect } from "next/navigation";

import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { AuthPageShell } from "@/components/cms/auth-page-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getMessagesForRequest } from "@/lib/i18n/server";
import { getCurrentAuthenticatedAccount } from "@/server/auth/current-account";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const authenticated = await getCurrentAuthenticatedAccount();

  if (authenticated) {
    redirect("/account");
  }

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const tokenValue = resolvedSearchParams.token;
  const token = typeof tokenValue === "string" ? tokenValue : "";
  const messages = await getMessagesForRequest();

  return (
    <AuthPageShell
      eyebrow={messages.resetPage.eyebrow}
      title={token ? messages.resetPage.titleWithToken : messages.resetPage.titleWithoutToken}
      description={
        token
          ? messages.resetPage.descriptionWithToken
          : messages.resetPage.descriptionWithoutToken
      }
      supportEyebrow={messages.resetPage.supportEyebrow}
      supportTitle={
        token
          ? messages.resetPage.supportTitleWithToken
          : messages.resetPage.supportTitleWithoutToken
      }
      supportDescription={
        token
          ? messages.resetPage.supportDescriptionWithToken
          : messages.resetPage.supportDescriptionWithoutToken
      }
      supportItems={[
        {
          title: token
            ? messages.resetPage.items.withTokenPrimaryTitle
            : messages.resetPage.items.withoutTokenPrimaryTitle,
          description: token
            ? messages.resetPage.items.withTokenPrimaryDescription
            : messages.resetPage.items.withoutTokenPrimaryDescription,
          icon: token ? <ShieldCheckIcon className="size-4" /> : <AlertTriangleIcon className="size-4" />,
        },
        {
          title: token
            ? messages.resetPage.items.withTokenSecondaryTitle
            : messages.resetPage.items.withoutTokenSecondaryTitle,
          description: token
            ? messages.resetPage.items.withTokenSecondaryDescription
            : messages.resetPage.items.withoutTokenSecondaryDescription,
          icon: <KeyRoundIcon className="size-4" />,
        },
        {
          title: token
            ? messages.resetPage.items.withTokenTertiaryTitle
            : messages.resetPage.items.withoutTokenTertiaryTitle,
          description: token
            ? messages.resetPage.items.withTokenTertiaryDescription
            : messages.resetPage.items.withoutTokenTertiaryDescription,
          icon: <ShieldIcon className="size-4" />,
        },
      ]}
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span>{messages.resetPage.footerPrompt}</span>
          <Link href={token ? "/login" : "/recover"} className="text-zinc-100 underline-offset-4 hover:underline">
            {token ? messages.common.backToSignIn : messages.common.goToRecovery}
          </Link>
        </div>
      }
    >
      {token ? (
        <ResetPasswordForm token={token} />
      ) : (
        <Card className="border-white/10 bg-white/[0.04] shadow-2xl shadow-black/30 backdrop-blur-xl">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl text-white">{messages.resetPage.missingTokenTitle}</CardTitle>
            <CardDescription className="text-zinc-400">
              {messages.resetPage.missingTokenDescription}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <Alert className="border-amber-400/20 bg-amber-500/10 text-amber-100">
              <AlertTriangleIcon className="size-4" />
              <AlertTitle>{messages.resetPage.missingTokenAlertTitle}</AlertTitle>
              <AlertDescription className="text-amber-100/90">
                {messages.resetPage.missingTokenAlertDescription}
              </AlertDescription>
            </Alert>
            <Button asChild className="bg-violet-500 text-white hover:bg-violet-400">
              <Link href="/recover">{messages.common.goToRecovery}</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </AuthPageShell>
  );
}
