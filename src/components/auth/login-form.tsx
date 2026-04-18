"use client";

import Link from "next/link";
import { LogInIcon, ShieldCheckIcon } from "lucide-react";
import { useActionState } from "react";

import { loginAction } from "@/app/auth/actions";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { emptyAuthActionState } from "@/server/auth/types";

export function LoginForm({ notice }: { notice?: string }) {
  const [state, formAction] = useActionState(loginAction, emptyAuthActionState);

  return (
    <Card className="border-white/10 bg-white/[0.04] shadow-2xl shadow-black/30 backdrop-blur-xl">
      <CardHeader className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-zinc-500">
          Metin2 CMS
        </p>
        <CardTitle className="text-2xl text-white">Sign in</CardTitle>
        <CardDescription className="text-zinc-400">
          Access your account dashboard, session controls and recovery settings.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-5">
          {notice ? (
            <Alert className="border-emerald-400/20 bg-emerald-500/10 text-emerald-100">
              <ShieldCheckIcon className="size-4" />
              <AlertTitle>Password updated</AlertTitle>
              <AlertDescription className="text-emerald-100/90">{notice}</AlertDescription>
            </Alert>
          ) : null}

          {state.message ? (
            <Alert variant="destructive" className="border-red-400/20 bg-red-500/10 text-red-100">
              <LogInIcon className="size-4" />
              <AlertTitle>Unable to sign in</AlertTitle>
              <AlertDescription className="text-red-100/90">{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="login" className="text-zinc-200">
              Login
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
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="password" className="text-zinc-200">
                Password
              </Label>
              <Link
                href="/recover"
                className="text-xs text-zinc-400 underline-offset-4 hover:text-zinc-200 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
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

          <Separator className="bg-white/8" />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <AuthSubmitButton
              idleLabel="Sign in"
              pendingLabel="Signing in..."
              className="bg-violet-500 text-white hover:bg-violet-400"
            />
            <Button asChild variant="ghost" className="justify-start px-0 text-zinc-300 hover:bg-transparent hover:text-white">
              <Link href="/register">Create account</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
