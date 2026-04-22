"use client";

import Link from "next/link";
import { KeyRoundIcon } from "lucide-react";
import { useActionState } from "react";

import { resetPasswordAction } from "@/app/auth/actions";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import { useI18n } from "@/components/i18n/i18n-provider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { emptyRecoveryActionState } from "@/server/recovery/types";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction] = useActionState(
    resetPasswordAction,
    emptyRecoveryActionState,
  );
  const resolvedToken = state.values?.token ?? token;
  const { messages } = useI18n();

  return (
    <Card className="site-surface rounded-[28px] bg-transparent py-0 shadow-none ring-0">
      <CardHeader className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-zinc-500">
          {messages.resetForm.eyebrow}
        </p>
        <CardTitle className="text-2xl text-white">{messages.resetForm.title}</CardTitle>
        <CardDescription className="text-zinc-400">
          {messages.resetForm.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-5">
          <input type="hidden" name="token" value={resolvedToken} />

          {state.message ? (
            <Alert variant="destructive" className="border-red-400/20 bg-red-500/10 text-red-100">
              <KeyRoundIcon className="size-4" />
              <AlertTitle>{messages.resetForm.errorTitle}</AlertTitle>
              <AlertDescription className="text-red-100/90">{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="password" className="text-zinc-200">
              {messages.common.newPassword}
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              maxLength={16}
              className="site-inset border-white/10 bg-black/20 text-zinc-100 placeholder:text-zinc-500"
            />
            {state.fieldErrors?.password?.[0] ? (
              <p className="text-xs text-red-300">{state.fieldErrors.password[0]}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="passwordConfirmation" className="text-zinc-200">
              {messages.common.confirmNewPassword}
            </Label>
            <Input
              id="passwordConfirmation"
              name="passwordConfirmation"
              type="password"
              required
              maxLength={16}
              className="site-inset border-white/10 bg-black/20 text-zinc-100 placeholder:text-zinc-500"
            />
            {state.fieldErrors?.passwordConfirmation?.[0] ? (
              <p className="text-xs text-red-300">{state.fieldErrors.passwordConfirmation[0]}</p>
            ) : null}
            {state.fieldErrors?.token?.[0] ? (
              <p className="text-xs text-red-300">{state.fieldErrors.token[0]}</p>
            ) : null}
          </div>

          <Separator className="bg-white/8" />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <AuthSubmitButton
              idleLabel={messages.common.updatePassword}
              pendingLabel={messages.common.updatePasswordPending}
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
