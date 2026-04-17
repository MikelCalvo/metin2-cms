import "server-only";

import { drizzle } from "drizzle-orm/mysql2";
import { createPool, type Pool } from "mysql2/promise";

import { authAuditLog, webSessions } from "@/lib/db/schema/cms";
import { legacyAccounts } from "@/lib/db/schema/account";
import { env } from "@/lib/env";

type GlobalDbPools = typeof globalThis & {
  __mt2CmsLegacyAccountPool?: Pool;
  __mt2CmsWebPool?: Pool;
};

const globalForDb = globalThis as GlobalDbPools;

export const legacyAccountPool =
  globalForDb.__mt2CmsLegacyAccountPool ?? createPool(env.DATABASE_URL);

export const cmsPool = globalForDb.__mt2CmsWebPool ?? createPool(env.CMS_DATABASE_URL);

if (process.env.NODE_ENV !== "production") {
  globalForDb.__mt2CmsLegacyAccountPool = legacyAccountPool;
  globalForDb.__mt2CmsWebPool = cmsPool;
}

export const legacyAccountDb = drizzle({
  client: legacyAccountPool,
  mode: "default",
  schema: { legacyAccounts },
});

export const cmsDb = drizzle({
  client: cmsPool,
  mode: "default",
  schema: { webSessions, authAuditLog },
});
