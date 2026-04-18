"use client";

import { useActionState } from "react";

import { updateProfileAction } from "@/app/account/actions";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import { emptyAccountProfileActionState } from "@/server/account/account-settings-types";

type ProfileSettingsFormProps = {
  email: string;
  socialId: string;
};

export function ProfileSettingsForm({
  email,
  socialId,
}: ProfileSettingsFormProps) {
  const [state, formAction] = useActionState(
    updateProfileAction,
    emptyAccountProfileActionState,
  );
  const resolvedEmail = state.values?.email ?? email;
  const resolvedSocialId = state.values?.socialId ?? socialId;

  return (
    <form action={formAction} className="space-y-5 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="space-y-1">
        <h2 className="text-lg font-medium text-neutral-950">Profile settings</h2>
        <p className="text-sm text-neutral-600">
          Update the legacy account contact email and delete code stored in the live
          account table.
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
          defaultValue={resolvedEmail}
          className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none transition focus:border-neutral-950"
        />
        {state.fieldErrors?.email?.[0] ? (
          <p className="text-xs text-red-600">{state.fieldErrors.email[0]}</p>
        ) : null}
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
          defaultValue={resolvedSocialId}
          className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none transition focus:border-neutral-950"
        />
        <p className="text-xs text-neutral-500">
          Legacy-compatible alphanumeric delete code used by the game account.
        </p>
        {state.fieldErrors?.socialId?.[0] ? (
          <p className="text-xs text-red-600">{state.fieldErrors.socialId[0]}</p>
        ) : null}
      </div>

      <AuthSubmitButton idleLabel="Save profile" pendingLabel="Saving profile..." />
    </form>
  );
}
