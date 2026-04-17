import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import mysql from "mysql2/promise";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

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

async function main() {
  const adminUrl = requireEnv("TEST_DATABASE_ADMIN_URL");
  const legacyDatabaseUrl = requireEnv("DATABASE_URL");
  const cmsDatabaseUrl = requireEnv("CMS_DATABASE_URL");

  const legacyDatabaseName = getDatabaseName(legacyDatabaseUrl);
  const cmsDatabaseName = getDatabaseName(cmsDatabaseUrl);

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
    await runSqlFile(
      cmsConnection,
      path.join(projectRoot, "drizzle", "0000_auth_tables.sql"),
    );
  } finally {
    await legacyConnection.end();
    await cmsConnection.end();
  }

  console.log(
    JSON.stringify(
      {
        legacyDatabaseName,
        cmsDatabaseName,
        accountSchema: "sql/test/account-test-schema.sql",
        cmsSchema: "drizzle/0000_auth_tables.sql",
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
