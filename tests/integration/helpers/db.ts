import { createPool } from "mysql2/promise";

import { assertSafeTestDatabaseUrl } from "@/lib/db/test-safety";

function requireEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required integration env: ${name}`);
  }

  return value;
}

export function assertIntegrationEnv() {
  const databaseUrl = requireEnv("DATABASE_URL");
  const cmsDatabaseUrl = requireEnv("CMS_DATABASE_URL");

  assertSafeTestDatabaseUrl(databaseUrl);
  assertSafeTestDatabaseUrl(cmsDatabaseUrl);
  requireEnv("APP_BASE_URL");
}

export function toMysqlDateTime(date: Date) {
  return date.toISOString().slice(0, 19).replace("T", " ");
}

let loginCounter = 0;

export function createLogin(prefix: string) {
  loginCounter += 1;
  return `${prefix}${Date.now().toString(36)}${loginCounter}`.slice(0, 16);
}

export async function resetIntegrationTables() {
  const databaseUrl = requireEnv("DATABASE_URL");
  const cmsDatabaseUrl = requireEnv("CMS_DATABASE_URL");

  assertSafeTestDatabaseUrl(databaseUrl);
  assertSafeTestDatabaseUrl(cmsDatabaseUrl);

  const legacyPool = createPool(databaseUrl);
  const cmsPool = createPool(cmsDatabaseUrl);

  try {
    await cmsPool.query("TRUNCATE TABLE auth_audit_log");
    await cmsPool.query("TRUNCATE TABLE password_recovery_tokens");
    await cmsPool.query("TRUNCATE TABLE web_sessions");
    await legacyPool.query("TRUNCATE TABLE account");
  } finally {
    await cmsPool.end();
    await legacyPool.end();
  }
}

export async function setLegacyAccountStatus(login: string, status: string) {
  const databaseUrl = requireEnv("DATABASE_URL");

  assertSafeTestDatabaseUrl(databaseUrl);

  const legacyPool = createPool(databaseUrl);

  try {
    await legacyPool.query("UPDATE account SET status = ? WHERE login = ?", [
      status,
      login,
    ]);
  } finally {
    await legacyPool.end();
  }
}

export async function countPasswordRecoveryTokens(login: string) {
  const cmsDatabaseUrl = requireEnv("CMS_DATABASE_URL");

  assertSafeTestDatabaseUrl(cmsDatabaseUrl);

  const cmsPool = createPool(cmsDatabaseUrl);

  try {
    const [rows] = await cmsPool.query(
      "SELECT COUNT(*) AS count FROM password_recovery_tokens WHERE login = ?",
      [login],
    );

    return Number((rows as Array<{ count: number }>)[0]?.count ?? 0);
  } finally {
    await cmsPool.end();
  }
}

export type AuthAuditLogRow = {
  id: number;
  eventType: string;
  login: string;
  accountId: number | null;
  success: number;
  detail: string | null;
};

export async function listAuthAuditLogEntries(login: string) {
  const cmsDatabaseUrl = requireEnv("CMS_DATABASE_URL");

  assertSafeTestDatabaseUrl(cmsDatabaseUrl);

  const cmsPool = createPool(cmsDatabaseUrl);

  try {
    const [rows] = await cmsPool.query(
      `SELECT id, event_type AS eventType, login, account_id AS accountId, success, detail
       FROM auth_audit_log
       WHERE login = ?
       ORDER BY id ASC`,
      [login],
    );

    return rows as AuthAuditLogRow[];
  } finally {
    await cmsPool.end();
  }
}
