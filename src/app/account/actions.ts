"use server";

import { redirect } from "next/navigation";

import { getCurrentAuthenticatedAccount } from "@/server/auth/current-account";
import { revokeOtherSessionsForAccount } from "@/server/session/session-service";

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
