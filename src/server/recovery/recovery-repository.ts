import "server-only";

import { and, eq, gt, isNull } from "drizzle-orm";

import { getCmsDb } from "@/lib/db/connection";
import {
  passwordRecoveryTokens,
  type NewPasswordRecoveryToken,
  type PasswordRecoveryToken,
} from "@/lib/db/schema/cms";

export async function createPasswordRecoveryToken(
  token: NewPasswordRecoveryToken,
): Promise<void> {
  await getCmsDb().insert(passwordRecoveryTokens).values(token);
}

export async function findActivePasswordRecoveryTokenByHash(
  tokenHash: string,
  currentTime: string,
): Promise<PasswordRecoveryToken | null> {
  const rows = await getCmsDb()
    .select()
    .from(passwordRecoveryTokens)
    .where(
      and(
        eq(passwordRecoveryTokens.tokenHash, tokenHash),
        isNull(passwordRecoveryTokens.consumedAt),
        gt(passwordRecoveryTokens.expiresAt, currentTime),
      ),
    )
    .limit(1);

  return rows[0] ?? null;
}

export async function consumePasswordRecoveryToken(
  tokenId: number,
  consumedAt: string,
): Promise<void> {
  await getCmsDb()
    .update(passwordRecoveryTokens)
    .set({ consumedAt })
    .where(eq(passwordRecoveryTokens.id, tokenId));
}
