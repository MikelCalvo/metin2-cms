"use client";

import Link from "next/link";
import { useActionState } from "react";

import { registerAction } from "@/app/auth/actions";
import { emptyAuthActionState } from "@/server/auth/types";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";

export function RegisterForm() {
  const [state, formAction] = useActionState(registerAction, emptyAuthActionState);

  return (
    <form action={formAction} className="space-y-5 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-950">
          Create account
        </h1>
        <p className="text-sm text-neutral-600">
          Register a legacy-compatible Metin2 account and start a CMS session.
        </p>
      </div>

      {state.message ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.message}
        </div>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
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
          <label htmlFor="email" className="text-sm font-medium text-neutral-900">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            maxLength={64}
            defaultValue={state.values?.email ?? ""}
            className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none transition focus:border-neutral-950"
          />
          {state.fieldErrors?.email?.[0] ? (
            <p className="text-xs text-red-600">{state.fieldErrors.email[0]}</p>
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

        <div className="space-y-2">
          <label htmlFor="passwordConfirmation" className="text-sm font-medium text-neutral-900">
            Confirm password
          </label>
          <input
            id="passwordConfirmation"
            name="passwordConfirmation"
            type="password"
            required
            maxLength={16}
            className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none transition focus:border-neutral-950"
          />
          {state.fieldErrors?.passwordConfirmation?.[0] ? (
            <p className="text-xs text-red-600">
              {state.fieldErrors.passwordConfirmation[0]}
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="socialId" className="text-sm font-medium text-neutral-900">
          Delete code / social ID
        </label>
        <input
          id="socialId"
          name="socialId"
          type="text"
          required
          minLength={7}
          maxLength={13}
          defaultValue={state.values?.socialId ?? ""}
          className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none transition focus:border-neutral-950"
        />
        <p className="text-xs text-neutral-500">
          Legacy-compatible alphanumeric delete code used by the game account.
        </p>
        {state.fieldErrors?.socialId?.[0] ? (
          <p className="text-xs text-red-600">{state.fieldErrors.socialId[0]}</p>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-4">
        <AuthSubmitButton idleLabel="Create account" pendingLabel="Creating..." />
        <Link href="/login" className="text-sm text-neutral-600 underline-offset-4 hover:underline">
          Back to sign in
        </Link>
      </div>
    </form>
  );
}
