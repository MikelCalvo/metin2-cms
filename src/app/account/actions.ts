"use server";

import { redirect } from "next/navigation";

import { getCurrentAuthenticatedAccount } from "@/server/auth/current-account";
import {
  revokeOtherSessionsForAccount,
  revokeSessionForAccount,
} from "@/server/session/session-service";

export async function closeOtherSessionsAction() {
  const authenticated = await getCurrentAuthenticatedAccount();

  if (!authenticated) {
    redirect("/login");
  }

  await revokeOtherSessionsForAccount(
    authenticated.account.id,
    authenticated.session.id,
  );

  redirect("/account");
}

export async function revokeSessionAction(formData: FormData) {
  const authenticated = await getCurrentAuthenticatedAccount();

  if (!authenticated) {
    redirect("/login");
  }

  const sessionId = formData.get("sessionId");

  if (typeof sessionId === "string" && sessionId.length > 0) {
    await revokeSessionForAccount(
      authenticated.account.id,
      sessionId,
      authenticated.session.id,
    );
  }

  redirect("/account");
}
