import "server-only";

import type { SessionContext } from "@/server/auth/types";

export async function issueAuthenticatedSession(
  _session: SessionContext,
): Promise<void> {
  throw new Error(
    "Not implemented: issueAuthenticatedSession will persist a CMS-owned session and set the secure session cookie.",
  );
}

export async function revokeAuthenticatedSession(
  _sessionId: string,
): Promise<void> {
  throw new Error(
    "Not implemented: revokeAuthenticatedSession will revoke the CMS-owned session and clear the session cookie.",
  );
}
