"use client";

import { useActionState } from "react";

import { changePasswordAction } from "@/app/account/actions";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import { emptyAccountPasswordChangeActionState } from "@/server/account/account-settings-types";

export function ChangePasswordForm() {
  const [state, formAction] = useActionState(
    changePasswordAction,
    emptyAccountPasswordChangeActionState,
  );

  return (
    <form action={formAction} className="space-y-5 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="space-y-1">
        <h2 className="text-lg font-medium text-neutral-950">Change password</h2>
        <p className="text-sm text-neutral-600">
          Update the legacy-compatible password for this account. Other active web
          sessions are revoked after a successful change.
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
        <label htmlFor="currentPassword" className="text-sm font-medium text-neutral-900">
          Current password
        </label>
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          required
          maxLength={16}
          className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none transition focus:border-neutral-950"
        />
        {state.fieldErrors?.currentPassword?.[0] ? (
          <p className="text-xs text-red-600">{state.fieldErrors.currentPassword[0]}</p>
        ) : null}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="newPassword" className="text-sm font-medium text-neutral-900">
            New password
          </label>
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            required
            maxLength={16}
            className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none transition focus:border-neutral-950"
          />
          {state.fieldErrors?.newPassword?.[0] ? (
            <p className="text-xs text-red-600">{state.fieldErrors.newPassword[0]}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="newPasswordConfirmation"
            className="text-sm font-medium text-neutral-900"
          >
            Confirm new password
          </label>
          <input
            id="newPasswordConfirmation"
            name="newPasswordConfirmation"
            type="password"
            required
            maxLength={16}
            className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none transition focus:border-neutral-950"
          />
          {state.fieldErrors?.newPasswordConfirmation?.[0] ? (
            <p className="text-xs text-red-600">
              {state.fieldErrors.newPasswordConfirmation[0]}
            </p>
          ) : null}
        </div>
      </div>

      <AuthSubmitButton
        idleLabel="Update password"
        pendingLabel="Updating password..."
      />
    </form>
  );
}
