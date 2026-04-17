import "server-only";

import { and, eq, gt, isNull } from "drizzle-orm";

import { getCmsDb } from "@/lib/db/connection";
import { webSessions, type NewWebSession, type WebSession } from "@/lib/db/schema/cms";

export async function createWebSession(session: NewWebSession): Promise<void> {
  await getCmsDb().insert(webSessions).values(session);
}

export async function findActiveSessionById(
  sessionId: string,
  currentTime: string,
): Promise<WebSession | null> {
  const rows = await getCmsDb()
    .select()
    .from(webSessions)
    .where(
      and(
        eq(webSessions.id, sessionId),
        isNull(webSessions.revokedAt),
        gt(webSessions.expiresAt, currentTime),
      ),
    )
    .limit(1);

  return rows[0] ?? null;
}

export async function revokeWebSession(
  sessionId: string,
  revokedAt: string,
): Promise<void> {
  await getCmsDb()
    .update(webSessions)
    .set({ revokedAt })
    .where(eq(webSessions.id, sessionId));
}
