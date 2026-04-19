"use client";

import Link from "next/link";
import { KeyRoundIcon, MailboxIcon } from "lucide-react";
import { useActionState } from "react";

import { requestRecoveryAction } from "@/app/auth/actions";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import { useI18n } from "@/components/i18n/i18n-provider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { emptyRecoveryActionState } from "@/server/recovery/types";

type RecoveryRequestFormProps = {
  temporaryDeliveryMode?: "preview" | "file";
};

export function RecoveryRequestForm({
  temporaryDeliveryMode = "preview",
}: RecoveryRequestFormProps) {
  const [state, formAction] = useActionState(
    requestRecoveryAction,
    emptyRecoveryActionState,
  );
  const { messages } = useI18n();

  return (
    <Card className="border-white/10 bg-white/[0.04] shadow-2xl shadow-black/30 backdrop-blur-xl">
      <CardHeader className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-zinc-500">
          {messages.recoverForm.eyebrow}
        </p>
        <CardTitle className="text-2xl text-white">{messages.recoverForm.title}</CardTitle>
        <CardDescription className="text-zinc-400">
          {messages.recoverForm.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-5">
          {state.message ? (
            <Alert
              variant={state.status === "success" ? "default" : "destructive"}
              className={
                state.status === "success"
                  ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-100"
                  : "border-red-400/20 bg-red-500/10 text-red-100"
              }
            >
              <KeyRoundIcon className="size-4" />
              <AlertTitle>
                {state.status === "success"
                  ? messages.recoverForm.successTitle
                  : messages.recoverForm.errorTitle}
              </AlertTitle>
              <AlertDescription className={state.status === "success" ? "text-emerald-100/90" : "text-red-100/90"}>
                {state.message}
              </AlertDescription>
            </Alert>
          ) : null}

          {temporaryDeliveryMode === "file" ? (
            <Alert className="border-sky-400/20 bg-sky-500/10 text-sky-100">
              <MailboxIcon className="size-4" />
              <AlertTitle>{messages.recoverForm.temporaryDeliveryTitle}</AlertTitle>
              <AlertDescription className="text-sky-100/90">
                {messages.recoverForm.temporaryDeliveryDescription}
              </AlertDescription>
            </Alert>
          ) : null}

          {state.previewResetUrl ? (
            <Alert className="border-amber-400/20 bg-amber-500/10 text-amber-100">
              <KeyRoundIcon className="size-4" />
              <AlertTitle>{messages.recoverForm.previewTitle}</AlertTitle>
              <AlertDescription className="break-all text-amber-100/90">
                {messages.recoverForm.previewPrefix}{" "}
                <a className="underline" href={state.previewResetUrl}>{state.previewResetUrl}</a>
              </AlertDescription>
            </Alert>
          ) : null}

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="login" className="text-zinc-200">
                {messages.common.login}
              </Label>
              <Input
                id="login"
                name="login"
                type="text"
                required
                maxLength={16}
                defaultValue={state.values?.login ?? ""}
                className="border-white/10 bg-black/20 text-zinc-100 placeholder:text-zinc-500"
              />
              {state.fieldErrors?.login?.[0] ? (
                <p className="text-xs text-red-300">{state.fieldErrors.login[0]}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-200">
                {messages.common.email}
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                maxLength={64}
                defaultValue={state.values?.email ?? ""}
                className="border-white/10 bg-black/20 text-zinc-100 placeholder:text-zinc-500"
              />
              {state.fieldErrors?.email?.[0] ? (
                <p className="text-xs text-red-300">{state.fieldErrors.email[0]}</p>
              ) : null}
            </div>
          </div>

          <Separator className="bg-white/8" />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <AuthSubmitButton
              idleLabel={messages.common.createRecoveryLink}
              pendingLabel={messages.common.recoveryPending}
              className="bg-violet-500 text-white hover:bg-violet-400"
            />
            <Button asChild variant="ghost" className="justify-start px-0 text-zinc-300 hover:bg-transparent hover:text-white">
              <Link href="/login">{messages.common.backToSignIn}</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
