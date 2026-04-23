import "server-only";

import { sanitizeDisplayText } from "@/lib/display-text";
import { findAccountById } from "@/server/account/account-repository";
import { getCurrentAuthenticatedSession, revokeSessionById } from "@/server/session/session-service";

export async function getCurrentAuthenticatedAccount() {
  const session = await getCurrentAuthenticatedSession();

  if (!session) {
    return null;
  }

  const account = await findAccountById(session.accountId);

  if (!account || account.status !== "OK") {
    await revokeSessionById(session.id);
    return null;
  }

  return {
    session,
    account: {
      ...account,
      login: sanitizeDisplayText(account.login ?? ""),
      email: sanitizeDisplayText(account.email ?? ""),
      socialId: sanitizeDisplayText(account.socialId ?? ""),
    },
  };
}
