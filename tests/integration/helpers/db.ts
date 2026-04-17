import { createPool } from "mysql2/promise";

function requireEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required integration env: ${name}`);
  }

  return value;
}

export function assertIntegrationEnv() {
  requireEnv("DATABASE_URL");
  requireEnv("CMS_DATABASE_URL");
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
  const legacyPool = createPool(requireEnv("DATABASE_URL"));
  const cmsPool = createPool(requireEnv("CMS_DATABASE_URL"));

  try {
    await cmsPool.query("TRUNCATE TABLE auth_audit_log");
    await cmsPool.query("TRUNCATE TABLE web_sessions");
    await legacyPool.query("TRUNCATE TABLE account");
  } finally {
    await cmsPool.end();
    await legacyPool.end();
  }
}
