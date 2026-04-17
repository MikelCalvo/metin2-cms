import "server-only";

import { and, desc, eq, gt, isNull, ne } from "drizzle-orm";

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

export async function listActiveSessionsForAccount(
  accountId: number,
  currentTime: string,
): Promise<WebSession[]> {
  return getCmsDb()
    .select()
    .from(webSessions)
    .where(
      and(
        eq(webSessions.accountId, accountId),
        isNull(webSessions.revokedAt),
        gt(webSessions.expiresAt, currentTime),
      ),
    )
    .orderBy(desc(webSessions.lastSeenAt), desc(webSessions.createdAt));
}

export async function touchActiveSessionLastSeen(
  sessionId: string,
  lastSeenAt: string,
  currentTime: string,
): Promise<void> {
  await getCmsDb()
    .update(webSessions)
    .set({ lastSeenAt })
    .where(
      and(
        eq(webSessions.id, sessionId),
        isNull(webSessions.revokedAt),
        gt(webSessions.expiresAt, currentTime),
      ),
    );
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

export async function revokeActiveSessionsForAccount(
  accountId: number,
  revokedAt: string,
): Promise<void> {
  await getCmsDb()
    .update(webSessions)
    .set({ revokedAt })
    .where(
      and(
        eq(webSessions.accountId, accountId),
        isNull(webSessions.revokedAt),
      ),
    );
}

export async function revokeOtherActiveSessionsForAccount(
  accountId: number,
  keepSessionId: string,
  revokedAt: string,
): Promise<void> {
  await getCmsDb()
    .update(webSessions)
    .set({ revokedAt })
    .where(
      and(
        eq(webSessions.accountId, accountId),
        ne(webSessions.id, keepSessionId),
        isNull(webSessions.revokedAt),
      ),
    );
}
