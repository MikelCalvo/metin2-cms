import { describe, expect, it } from "vitest";

import { parseLoginFormData, parseRegisterFormData } from "@/server/auth/validation";

function createFormData(entries: Array<[string, string]>) {
  const formData = new FormData();

  for (const [key, value] of entries) {
    formData.set(key, value);
  }

  return formData;
}

describe("auth validation", () => {
  it("parses a valid login payload", () => {
    const result = parseLoginFormData(
      createFormData([
        ["login", "tester01"],
        ["password", "abc12345"],
      ]),
      { ip: "127.0.0.1", userAgent: "Vitest" },
    );

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data).toMatchObject({
        login: "tester01",
        password: "abc12345",
        ip: "127.0.0.1",
        userAgent: "Vitest",
      });
    }
  });

  it("rejects a login with non-alphanumeric account name", () => {
    const result = parseLoginFormData(
      createFormData([
        ["login", "tester-01"],
        ["password", "abc12345"],
      ]),
    );

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.flatten().fieldErrors.login).toBeDefined();
    }
  });

  it("rejects a register payload with mismatched passwords", () => {
    const result = parseRegisterFormData(
      createFormData([
        ["login", "tester01"],
        ["email", "tester@example.com"],
        ["password", "abc12345"],
        ["passwordConfirmation", "abc12346"],
        ["socialId", "1234567"],
      ]),
    );

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.flatten().fieldErrors.passwordConfirmation).toEqual([
        "Passwords must match.",
      ]);
    }
  });

  it("rejects a register payload with an invalid delete code", () => {
    const result = parseRegisterFormData(
      createFormData([
        ["login", "tester01"],
        ["email", "tester@example.com"],
        ["password", "abc12345"],
        ["passwordConfirmation", "abc12345"],
        ["socialId", "12-34"],
      ]),
    );

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.flatten().fieldErrors.socialId).toBeDefined();
    }
  });
});
