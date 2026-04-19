"use client";

import Link from "next/link";
import { UserPlusIcon } from "lucide-react";
import { useActionState } from "react";

import { registerAction } from "@/app/auth/actions";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import { useI18n } from "@/components/i18n/i18n-provider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { emptyAuthActionState } from "@/server/auth/types";

export function RegisterForm() {
  const [state, formAction] = useActionState(registerAction, emptyAuthActionState);
  const { messages } = useI18n();

  return (
    <Card className="border-white/10 bg-white/[0.04] shadow-2xl shadow-black/30 backdrop-blur-xl">
      <CardHeader className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-zinc-500">
          {messages.registerForm.eyebrow}
        </p>
        <CardTitle className="text-2xl text-white">{messages.registerForm.title}</CardTitle>
        <CardDescription className="text-zinc-400">
          {messages.registerForm.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-5">
          {state.message ? (
            <Alert variant="destructive" className="border-red-400/20 bg-red-500/10 text-red-100">
              <UserPlusIcon className="size-4" />
              <AlertTitle>{messages.registerForm.errorTitle}</AlertTitle>
              <AlertDescription className="text-red-100/90">{state.message}</AlertDescription>
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

            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-200">
                {messages.common.password}
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                maxLength={16}
                className="border-white/10 bg-black/20 text-zinc-100 placeholder:text-zinc-500"
              />
              {state.fieldErrors?.password?.[0] ? (
                <p className="text-xs text-red-300">{state.fieldErrors.password[0]}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="passwordConfirmation" className="text-zinc-200">
                {messages.common.confirmPassword}
              </Label>
              <Input
                id="passwordConfirmation"
                name="passwordConfirmation"
                type="password"
                required
                maxLength={16}
                className="border-white/10 bg-black/20 text-zinc-100 placeholder:text-zinc-500"
              />
              {state.fieldErrors?.passwordConfirmation?.[0] ? (
                <p className="text-xs text-red-300">{state.fieldErrors.passwordConfirmation[0]}</p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="socialId" className="text-zinc-200">
              {messages.common.deleteCode}
            </Label>
            <Input
              id="socialId"
              name="socialId"
              type="text"
              required
              minLength={7}
              maxLength={13}
              defaultValue={state.values?.socialId ?? ""}
              className="border-white/10 bg-black/20 text-zinc-100 placeholder:text-zinc-500"
            />
            <p className="text-xs text-zinc-500">
              {messages.registerForm.socialIdHint}
            </p>
            {state.fieldErrors?.socialId?.[0] ? (
              <p className="text-xs text-red-300">{state.fieldErrors.socialId[0]}</p>
            ) : null}
          </div>

          <Separator className="bg-white/8" />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <AuthSubmitButton
              idleLabel={messages.common.createAccount}
              pendingLabel={messages.common.createPending}
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
