import "server-only";

import { eq } from "drizzle-orm";

import { getLegacyAccountDb } from "@/lib/db/connection";
import {
  legacyAccounts,
  type LegacyAccount,
  type NewLegacyAccount,
} from "@/lib/db/schema/account";

export async function findAccountByLogin(login: string): Promise<LegacyAccount | null> {
  const rows = await getLegacyAccountDb()
    .select()
    .from(legacyAccounts)
    .where(eq(legacyAccounts.login, login))
    .limit(1);

  return rows[0] ?? null;
}

export async function findAccountById(accountId: number): Promise<LegacyAccount | null> {
  const rows = await getLegacyAccountDb()
    .select()
    .from(legacyAccounts)
    .where(eq(legacyAccounts.id, accountId))
    .limit(1);

  return rows[0] ?? null;
}

export async function createLegacyAccount(account: NewLegacyAccount): Promise<void> {
  await getLegacyAccountDb().insert(legacyAccounts).values(account);
}

export async function updateLegacyAccountPassword(
  accountId: number,
  passwordHash: string,
): Promise<void> {
  await getLegacyAccountDb()
    .update(legacyAccounts)
    .set({ password: passwordHash })
    .where(eq(legacyAccounts.id, accountId));
}

export async function updateLegacyAccountProfile(
  accountId: number,
  profile: {
    email: string;
    socialId: string;
  },
): Promise<void> {
  await getLegacyAccountDb()
    .update(legacyAccounts)
    .set({
      email: profile.email,
      socialId: profile.socialId,
    })
    .where(eq(legacyAccounts.id, accountId));
}
