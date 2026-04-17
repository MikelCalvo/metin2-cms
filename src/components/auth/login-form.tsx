"use client";

import Link from "next/link";
import { useActionState } from "react";

import { emptyAuthActionState } from "@/server/auth/types";
import { loginAction } from "@/app/auth/actions";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, emptyAuthActionState);

  return (
    <form action={formAction} className="space-y-5 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-950">
          Sign in
        </h1>
        <p className="text-sm text-neutral-600">
          Access your Metin2 account from the modern CMS.
        </p>
      </div>

      {state.message ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.message}
        </div>
      ) : null}

      <div className="space-y-2">
        <label htmlFor="login" className="text-sm font-medium text-neutral-900">
          Login
        </label>
        <input
          id="login"
          name="login"
          type="text"
          required
          maxLength={16}
          defaultValue={state.values?.login ?? ""}
          className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none transition focus:border-neutral-950"
        />
        {state.fieldErrors?.login?.[0] ? (
          <p className="text-xs text-red-600">{state.fieldErrors.login[0]}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-neutral-900">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          maxLength={16}
          className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none transition focus:border-neutral-950"
        />
        {state.fieldErrors?.password?.[0] ? (
          <p className="text-xs text-red-600">{state.fieldErrors.password[0]}</p>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-4">
        <AuthSubmitButton idleLabel="Sign in" pendingLabel="Signing in..." />
        <Link href="/register" className="text-sm text-neutral-600 underline-offset-4 hover:underline">
          Create account
        </Link>
      </div>
    </form>
  );
}
