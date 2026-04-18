"use client";

import { KeyRoundIcon, ShieldAlertIcon } from "lucide-react";
import { useActionState } from "react";

import { changePasswordAction } from "@/app/account/actions";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { emptyAccountPasswordChangeActionState } from "@/server/account/account-settings-types";

export function ChangePasswordForm() {
  const [state, formAction] = useActionState(
    changePasswordAction,
    emptyAccountPasswordChangeActionState,
  );

  return (
    <Card className="border-white/10 bg-white/[0.04] shadow-2xl shadow-black/20 backdrop-blur-xl">
      <CardHeader className="space-y-2">
        <CardTitle className="text-lg text-white">Password & recovery</CardTitle>
        <CardDescription className="text-zinc-400">
          Change the legacy-compatible password. Other active CMS sessions are revoked
          after a successful update.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-5">
          {state.message ? (
            <Alert
              variant={state.status === "error" ? "destructive" : "default"}
              className={
                state.status === "error"
                  ? "border-red-400/20 bg-red-500/10 text-red-100"
                  : "border-emerald-400/20 bg-emerald-500/10 text-emerald-100"
              }
            >
              {state.status === "error" ? (
                <ShieldAlertIcon className="size-4" />
              ) : (
                <KeyRoundIcon className="size-4" />
              )}
              <AlertTitle>
                {state.status === "error" ? "Password update failed" : "Password updated"}
              </AlertTitle>
              <AlertDescription className={state.status === "error" ? "text-red-100/90" : "text-emerald-100/90"}>
                {state.message}
              </AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="currentPassword" className="text-zinc-200">
              Current password
            </Label>
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              required
              maxLength={16}
              className="border-white/10 bg-black/20 text-zinc-100 placeholder:text-zinc-500"
            />
            {state.fieldErrors?.currentPassword?.[0] ? (
              <p className="text-xs text-red-300">{state.fieldErrors.currentPassword[0]}</p>
            ) : null}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-zinc-200">
                New password
              </Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                maxLength={16}
                className="border-white/10 bg-black/20 text-zinc-100 placeholder:text-zinc-500"
              />
              {state.fieldErrors?.newPassword?.[0] ? (
                <p className="text-xs text-red-300">{state.fieldErrors.newPassword[0]}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPasswordConfirmation" className="text-zinc-200">
                Confirm new password
              </Label>
              <Input
                id="newPasswordConfirmation"
                name="newPasswordConfirmation"
                type="password"
                required
                maxLength={16}
                className="border-white/10 bg-black/20 text-zinc-100 placeholder:text-zinc-500"
              />
              {state.fieldErrors?.newPasswordConfirmation?.[0] ? (
                <p className="text-xs text-red-300">{state.fieldErrors.newPasswordConfirmation[0]}</p>
              ) : null}
            </div>
          </div>

          <Separator className="bg-white/8" />

          <AuthSubmitButton
            idleLabel="Update password"
            pendingLabel="Updating password..."
            className="bg-violet-500 text-white hover:bg-violet-400"
          />
        </form>
      </CardContent>
    </Card>
  );
}
