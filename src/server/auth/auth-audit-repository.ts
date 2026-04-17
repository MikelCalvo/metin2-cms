import "server-only";

import { and, desc, eq, gte, sql } from "drizzle-orm";

import { getCmsDb } from "@/lib/db/connection";
import { authAuditLog, type NewAuthAuditLogEntry } from "@/lib/db/schema/cms";

export async function createAuthAuditLogEntry(
  entry: NewAuthAuditLogEntry,
): Promise<void> {
  await getCmsDb().insert(authAuditLog).values(entry);
}

export async function countAuthAuditEntriesSince(options: {
  eventType: string;
  since: string;
  login?: string;
  ip?: string | null;
  success?: 0 | 1;
}): Promise<number> {
  const conditions = [
    eq(authAuditLog.eventType, options.eventType),
    gte(authAuditLog.createdAt, options.since),
  ];

  if (typeof options.login === "string") {
    conditions.push(eq(authAuditLog.login, options.login));
  }

  if (typeof options.ip === "string") {
    conditions.push(eq(authAuditLog.ip, options.ip));
  }

  if (typeof options.success === "number") {
    conditions.push(eq(authAuditLog.success, options.success));
  }

  const rows = await getCmsDb()
    .select({ count: sql<number>`count(*)` })
    .from(authAuditLog)
    .where(and(...conditions));

  return Number(rows[0]?.count ?? 0);
}

export async function listRecentAuthAuditEntriesForAccount(
  accountId: number,
  limit: number,
) {
  return getCmsDb()
    .select()
    .from(authAuditLog)
    .where(eq(authAuditLog.accountId, accountId))
    .orderBy(desc(authAuditLog.createdAt), desc(authAuditLog.id))
    .limit(limit);
}
