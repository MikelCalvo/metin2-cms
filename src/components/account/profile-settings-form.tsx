"use client";

import { MailIcon, ShieldIcon } from "lucide-react";
import { useActionState } from "react";

import { updateProfileAction } from "@/app/account/actions";
import { StatusChip } from "@/components/account/status-chip";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { emptyAccountProfileActionState } from "@/server/account/account-settings-types";

type ProfileSettingsFormProps = {
  login: string;
  status: string;
  email: string;
  socialId: string;
};

export function ProfileSettingsForm({
  login,
  status,
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
    <Card className="border-white/10 bg-white/[0.04] shadow-2xl shadow-black/20 backdrop-blur-xl">
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-lg text-white">Profile settings</CardTitle>
            <CardDescription className="text-zinc-400">
              Manage the live legacy account contact details used by the CMS and the game.
            </CardDescription>
          </div>
          <StatusChip tone={status === "OK" ? "success" : "attention"}>{status}</StatusChip>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/8 bg-black/20 px-3 py-3">
            <p className="text-[0.72rem] uppercase tracking-[0.14em] text-zinc-500">Login</p>
            <p className="mt-1 text-sm font-medium text-zinc-100">{login}</p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-black/20 px-3 py-3">
            <p className="text-[0.72rem] uppercase tracking-[0.14em] text-zinc-500">Delete code</p>
            <p className="mt-1 text-sm font-medium text-zinc-100">{resolvedSocialId || "—"}</p>
          </div>
        </div>
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
              {state.status === "error" ? <ShieldIcon className="size-4" /> : <MailIcon className="size-4" />}
              <AlertTitle>{state.status === "error" ? "Profile update failed" : "Profile updated"}</AlertTitle>
              <AlertDescription className={state.status === "error" ? "text-red-100/90" : "text-emerald-100/90"}>
                {state.message}
              </AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-zinc-200">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              maxLength={64}
              defaultValue={resolvedEmail}
              className="border-white/10 bg-black/20 text-zinc-100 placeholder:text-zinc-500"
            />
            {state.fieldErrors?.email?.[0] ? (
              <p className="text-xs text-red-300">{state.fieldErrors.email[0]}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="socialId" className="text-zinc-200">
              Delete code / social ID
            </Label>
            <Input
              id="socialId"
              name="socialId"
              type="text"
              required
              minLength={7}
              maxLength={13}
              defaultValue={resolvedSocialId}
              className="border-white/10 bg-black/20 text-zinc-100 placeholder:text-zinc-500"
            />
            <p className="text-xs text-zinc-500">
              Legacy-compatible alphanumeric delete code stored in the account table.
            </p>
            {state.fieldErrors?.socialId?.[0] ? (
              <p className="text-xs text-red-300">{state.fieldErrors.socialId[0]}</p>
            ) : null}
          </div>

          <Separator className="bg-white/8" />

          <AuthSubmitButton
            idleLabel="Save profile"
            pendingLabel="Saving profile..."
            className="bg-violet-500 text-white hover:bg-violet-400"
          />
        </form>
      </CardContent>
    </Card>
  );
}
