import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import mysql from "mysql2/promise";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const RESERVED_DATABASE_NAMES = new Set([
  "account",
  "common",
  "hotbackup",
  "information_schema",
  "log",
  "metin2_cms",
  "mysql",
  "performance_schema",
  "player",
  "sys",
  "test",
]);

function requireEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function getDatabaseName(connectionString) {
  const url = new URL(connectionString);
  const databaseName = url.pathname.replace(/^\//, "");

  if (!databaseName) {
    throw new Error(`Connection string is missing a database name: ${connectionString}`);
  }

  return databaseName;
}

function assertSafeTestDatabaseName(databaseName) {
  if (RESERVED_DATABASE_NAMES.has(databaseName)) {
    throw new Error(`Refusing to operate on a reserved database: ${databaseName}`);
  }

  if (!databaseName.endsWith("_test")) {
    throw new Error(`Refusing to operate on a non-test database: ${databaseName}`);
  }

  return databaseName;
}

function escapeIdentifier(identifier) {
  return `\`${identifier.replace(/`/g, "``")}\``;
}

function splitSqlStatements(sql) {
  return sql
    .split(/;\s*(?:\r?\n|$)/g)
    .map((statement) => statement.trim())
    .filter(Boolean);
}

async function runSqlFile(connection, filePath) {
  const sql = await readFile(filePath, "utf8");

  for (const statement of splitSqlStatements(sql)) {
    await connection.query(statement);
  }
}

async function runCmsSqlMigrations(connection) {
  const drizzleDir = path.join(projectRoot, "drizzle");
  const files = (await readdir(drizzleDir))
    .filter((file) => /^\d+.*\.sql$/.test(file))
    .sort();

  for (const file of files) {
    await runSqlFile(connection, path.join(drizzleDir, file));
  }

  return files;
}

async function main() {
  const adminUrl = requireEnv("TEST_DATABASE_ADMIN_URL");
  const legacyDatabaseUrl = requireEnv("DATABASE_URL");
  const cmsDatabaseUrl = requireEnv("CMS_DATABASE_URL");

  const legacyDatabaseName = assertSafeTestDatabaseName(
    getDatabaseName(legacyDatabaseUrl),
  );
  const cmsDatabaseName = assertSafeTestDatabaseName(
    getDatabaseName(cmsDatabaseUrl),
  );

  const adminConnection = await mysql.createConnection(adminUrl);

  try {
    await adminConnection.query(`DROP DATABASE IF EXISTS ${escapeIdentifier(cmsDatabaseName)}`);
    await adminConnection.query(`DROP DATABASE IF EXISTS ${escapeIdentifier(legacyDatabaseName)}`);
    await adminConnection.query(
      `CREATE DATABASE ${escapeIdentifier(legacyDatabaseName)} CHARACTER SET ascii COLLATE ascii_general_ci`,
    );
    await adminConnection.query(
      `CREATE DATABASE ${escapeIdentifier(cmsDatabaseName)} CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci`,
    );
  } finally {
    await adminConnection.end();
  }

  const legacyAdminUrl = new URL(adminUrl);
  legacyAdminUrl.pathname = `/${legacyDatabaseName}`;

  const cmsAdminUrl = new URL(adminUrl);
  cmsAdminUrl.pathname = `/${cmsDatabaseName}`;

  const legacyConnection = await mysql.createConnection(legacyAdminUrl.toString());
  const cmsConnection = await mysql.createConnection(cmsAdminUrl.toString());

  try {
    await runSqlFile(
      legacyConnection,
      path.join(projectRoot, "sql", "test", "account-test-schema.sql"),
    );
    const cmsMigrations = await runCmsSqlMigrations(cmsConnection);

    console.log(
      JSON.stringify(
        {
          legacyDatabaseName,
          cmsDatabaseName,
          accountSchema: "sql/test/account-test-schema.sql",
          cmsMigrations,
        },
        null,
        2,
      ),
    );
  } finally {
    await legacyConnection.end();
    await cmsConnection.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
