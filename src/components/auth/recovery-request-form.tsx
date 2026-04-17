"use client";

import Link from "next/link";
import { useActionState } from "react";

import { requestRecoveryAction } from "@/app/auth/actions";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
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

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
    >
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-950">
          Recover password
        </h1>
        <p className="text-sm text-neutral-600">
          Enter the login and email tied to the legacy Metin2 account.
        </p>
      </div>

      {state.message ? (
        <div
          className={
            state.status === "success"
              ? "rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
              : "rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          }
        >
          {state.message}
        </div>
      ) : null}

      {temporaryDeliveryMode === "file" ? (
        <div className="rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-800">
          Temporary delivery mode: the CMS is not sending emails yet. Matching
          recovery requests are queued on the server for manual handling by an
          operator.
        </div>
      ) : null}

      {state.previewResetUrl ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          <p className="font-medium">Development preview</p>
          <p className="mt-1 break-all">
            Reset link: <a className="underline" href={state.previewResetUrl}>{state.previewResetUrl}</a>
          </p>
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
      </div>

      <div className="flex items-center justify-between gap-4">
        <AuthSubmitButton
          idleLabel="Create recovery link"
          pendingLabel="Creating link..."
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
