"use client";

import Link from "next/link";
import { useActionState } from "react";

import { resetPasswordAction } from "@/app/auth/actions";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import { emptyRecoveryActionState } from "@/server/recovery/types";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction] = useActionState(
    resetPasswordAction,
    emptyRecoveryActionState,
  );
  const resolvedToken = state.values?.token ?? token;

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
    >
      <input type="hidden" name="token" value={resolvedToken} />

      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-950">
          Set a new password
        </h1>
        <p className="text-sm text-neutral-600">
          Choose a new legacy-compatible password for your Metin2 account.
        </p>
      </div>

      {state.message ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.message}
        </div>
      ) : null}

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-neutral-900">
          New password
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
        <label
          htmlFor="passwordConfirmation"
          className="text-sm font-medium text-neutral-900"
        >
          Confirm new password
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
        {state.fieldErrors?.token?.[0] ? (
          <p className="text-xs text-red-600">{state.fieldErrors.token[0]}</p>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-4">
        <AuthSubmitButton
          idleLabel="Update password"
          pendingLabel="Updating..."
        />
        <Link
          href="/login"
          className="text-sm text-neutral-600 underline-offset-4 hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    </form>
  );
}
