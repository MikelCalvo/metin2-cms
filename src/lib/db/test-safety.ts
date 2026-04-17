import "server-only";

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

export function getDatabaseNameFromConnectionString(connectionString: string) {
  const url = new URL(connectionString);
  const databaseName = url.pathname.replace(/^\//, "");

  if (!databaseName) {
    throw new Error(
      `Connection string is missing a database name: ${connectionString}`,
    );
  }

  return databaseName;
}

export function assertSafeTestDatabaseName(databaseName: string) {
  if (RESERVED_DATABASE_NAMES.has(databaseName)) {
    throw new Error(
      `Refusing to operate on a reserved database: ${databaseName}`,
    );
  }

  if (!databaseName.endsWith("_test")) {
    throw new Error(
      `Refusing to operate on a non-test database: ${databaseName}`,
    );
  }

  return databaseName;
}

export function assertSafeTestDatabaseUrl(connectionString: string) {
  return assertSafeTestDatabaseName(
    getDatabaseNameFromConnectionString(connectionString),
  );
}
