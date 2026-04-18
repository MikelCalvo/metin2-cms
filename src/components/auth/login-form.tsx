"use client";

import Link from "next/link";
import { EyeIcon, EyeOffIcon, LogInIcon, ShieldCheckIcon } from "lucide-react";
import { useActionState, useState } from "react";

import { loginAction } from "@/app/auth/actions";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { emptyAuthActionState } from "@/server/auth/types";

export function LoginForm({ notice }: { notice?: string }) {
  const [state, formAction] = useActionState(loginAction, emptyAuthActionState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Card className="w-full border-white/10 bg-white/[0.04] shadow-2xl shadow-black/30 backdrop-blur-xl">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl text-white">Sign in</CardTitle>
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
            <Label htmlFor="password" className="text-zinc-200">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                maxLength={16}
                className="border-white/10 bg-black/20 pr-10 text-zinc-100 placeholder:text-zinc-500"
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((current) => !current)}
                className="absolute inset-y-0 right-0 flex items-center justify-center px-3 text-zinc-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:text-white"
              >
                {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
              </button>
            </div>
            {state.fieldErrors?.password?.[0] ? (
              <p className="text-xs text-red-300">{state.fieldErrors.password[0]}</p>
            ) : null}
            <div className="flex justify-end">
              <Link
                href="/recover"
                className="text-xs text-zinc-400 underline-offset-4 hover:text-zinc-200 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <AuthSubmitButton
              idleLabel="Sign in"
              pendingLabel="Signing in..."
              className="w-full bg-violet-500 text-white hover:bg-violet-400"
            />
            <div className="text-center text-sm text-zinc-400">
              Need an account?{" "}
              <Link href="/register" className="text-zinc-100 underline-offset-4 hover:underline">
                Create account
              </Link>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
