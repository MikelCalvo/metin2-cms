import "server-only";

import { eq } from "drizzle-orm";

import { legacyAccountDb } from "@/lib/db/connection";
import { legacyAccounts, type LegacyAccount, type NewLegacyAccount } from "@/lib/db/schema/account";

export async function findAccountByLogin(login: string): Promise<LegacyAccount | null> {
  const rows = await legacyAccountDb
    .select()
    .from(legacyAccounts)
    .where(eq(legacyAccounts.login, login))
    .limit(1);

  return rows[0] ?? null;
}

export async function findAccountById(accountId: number): Promise<LegacyAccount | null> {
  const rows = await legacyAccountDb
    .select()
    .from(legacyAccounts)
    .where(eq(legacyAccounts.id, accountId))
    .limit(1);

  return rows[0] ?? null;
}

export async function createLegacyAccount(account: NewLegacyAccount): Promise<void> {
  await legacyAccountDb.insert(legacyAccounts).values(account);
}
