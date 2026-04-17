import "server-only";

import { drizzle } from "drizzle-orm/mysql2";
import { createPool, type Pool } from "mysql2/promise";

import {
  authAuditLog,
  passwordRecoveryTokens,
  webSessions,
} from "@/lib/db/schema/cms";
import { legacyAccounts } from "@/lib/db/schema/account";
import { getEnv } from "@/lib/env";

type GlobalDbPools = typeof globalThis & {
  __mt2CmsLegacyAccountPool?: Pool;
  __mt2CmsWebPool?: Pool;
};

const globalForDb = globalThis as GlobalDbPools;

export function getLegacyAccountPool(): Pool {
  if (globalForDb.__mt2CmsLegacyAccountPool) {
    return globalForDb.__mt2CmsLegacyAccountPool;
  }

  const pool = createPool(getEnv().DATABASE_URL);

  if (process.env.NODE_ENV !== "production") {
    globalForDb.__mt2CmsLegacyAccountPool = pool;
  }

  return pool;
}

export function getCmsPool(): Pool {
  if (globalForDb.__mt2CmsWebPool) {
    return globalForDb.__mt2CmsWebPool;
  }

  const pool = createPool(getEnv().CMS_DATABASE_URL);

  if (process.env.NODE_ENV !== "production") {
    globalForDb.__mt2CmsWebPool = pool;
  }

  return pool;
}

export async function closeDbPools(): Promise<void> {
  const pools = [
    globalForDb.__mt2CmsLegacyAccountPool,
    globalForDb.__mt2CmsWebPool,
  ].filter((pool): pool is Pool => Boolean(pool));

  globalForDb.__mt2CmsLegacyAccountPool = undefined;
  globalForDb.__mt2CmsWebPool = undefined;

  await Promise.all(pools.map(async (pool) => pool.end()));
}

export function getLegacyAccountDb() {
  return drizzle({
    client: getLegacyAccountPool(),
    mode: "default",
    schema: { legacyAccounts },
  });
}

export function getCmsDb() {
  return drizzle({
    client: getCmsPool(),
    mode: "default",
    schema: { webSessions, authAuditLog, passwordRecoveryTokens },
  });
}
