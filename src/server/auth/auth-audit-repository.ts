import "server-only";

import { and, eq, gte, sql } from "drizzle-orm";

import { getCmsDb } from "@/lib/db/connection";
import { authAuditLog, type NewAuthAuditLogEntry } from "@/lib/db/schema/cms";

export async function createAuthAuditLogEntry(
  entry: NewAuthAuditLogEntry,
): Promise<void> {
  await getCmsDb().insert(authAuditLog).values(entry);
}

export async function countAuthAuditEntriesSince(options: {
  eventType: string;
  login: string;
  since: string;
}): Promise<number> {
  const rows = await getCmsDb()
    .select({ count: sql<number>`count(*)` })
    .from(authAuditLog)
    .where(
      and(
        eq(authAuditLog.eventType, options.eventType),
        eq(authAuditLog.login, options.login),
        gte(authAuditLog.createdAt, options.since),
      ),
    );

  return Number(rows[0]?.count ?? 0);
}
