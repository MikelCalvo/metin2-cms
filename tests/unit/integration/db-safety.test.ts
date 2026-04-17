import { describe, expect, it } from "vitest";

import {
  assertSafeTestDatabaseName,
  getDatabaseNameFromConnectionString,
} from "@/lib/db/test-safety";

describe("test database safety", () => {
  it("extracts the database name from a connection string", () => {
    expect(
      getDatabaseNameFromConnectionString(
        "mysql://user:pass@127.0.0.1:3306/account_test",
      ),
    ).toBe("account_test");
  });

  it("accepts databases ending in _test", () => {
    expect(assertSafeTestDatabaseName("account_test")).toBe("account_test");
    expect(assertSafeTestDatabaseName("metin2_cms_test")).toBe(
      "metin2_cms_test",
    );
  });

  it("rejects live or reserved database names", () => {
    expect(() => assertSafeTestDatabaseName("account")).toThrow(
      "Refusing to operate on a reserved database",
    );
    expect(() => assertSafeTestDatabaseName("metin2_cms")).toThrow(
      "Refusing to operate on a reserved database",
    );
    expect(() => assertSafeTestDatabaseName("mysql")).toThrow(
      "Refusing to operate on a reserved database",
    );
  });
});
