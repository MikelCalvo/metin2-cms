import { describe, expect, it } from "vitest";

import {
  parseAccountPasswordChangeFormData,
  parseAccountProfileFormData,
} from "@/server/account/account-settings-validation";

function createFormData(entries: Array<[string, string]>) {
  const formData = new FormData();

  for (const [key, value] of entries) {
    formData.set(key, value);
  }

  return formData;
}

describe("account settings validation", () => {
  it("parses a valid authenticated password change payload", () => {
    const result = parseAccountPasswordChangeFormData(
      createFormData([
        ["currentPassword", "abc12345"],
        ["newPassword", "newpass12"],
        ["newPasswordConfirmation", "newpass12"],
      ]),
      { ip: "127.0.0.1", userAgent: "Vitest" },
    );

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data).toMatchObject({
        currentPassword: "abc12345",
        newPassword: "newpass12",
        newPasswordConfirmation: "newpass12",
        ip: "127.0.0.1",
        userAgent: "Vitest",
      });
    }
  });

  it("rejects a password change payload with mismatched new passwords", () => {
    const result = parseAccountPasswordChangeFormData(
      createFormData([
        ["currentPassword", "abc12345"],
        ["newPassword", "newpass12"],
        ["newPasswordConfirmation", "newpass13"],
      ]),
    );

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.flatten().fieldErrors.newPasswordConfirmation).toEqual([
        "Passwords must match.",
      ]);
    }
  });

  it("parses a valid authenticated profile update payload", () => {
    const result = parseAccountProfileFormData(
      createFormData([
        ["email", "tester@example.com"],
        ["socialId", "7654321"],
      ]),
      { ip: "127.0.0.1", userAgent: "Vitest" },
    );

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data).toMatchObject({
        email: "tester@example.com",
        socialId: "7654321",
        ip: "127.0.0.1",
        userAgent: "Vitest",
      });
    }
  });

  it("rejects a profile update payload with an invalid delete code", () => {
    const result = parseAccountProfileFormData(
      createFormData([
        ["email", "tester@example.com"],
        ["socialId", "12-34"],
      ]),
    );

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.flatten().fieldErrors.socialId).toBeDefined();
    }
  });
});
