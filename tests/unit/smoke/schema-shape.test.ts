import { getTableColumns } from "drizzle-orm";
import { describe, expect, it } from "vitest";

import { legacyAccounts } from "@/lib/db/schema/account";

describe("legacy account schema mirror", () => {
  it("includes the auth-relevant live columns and excludes PHP-only assumptions", () => {
    const columns = Object.keys(getTableColumns(legacyAccounts));

    expect(columns).toEqual(
      expect.arrayContaining([
        "login",
        "password",
        "socialId",
        "email",
        "status",
        "cash",
        "mileage",
        "lastPlay",
      ]),
    );

    expect(columns).not.toContain("realName");
    expect(columns).not.toContain("coins");
  });
});
