import { describe, expect, it } from "vitest";

import {
  parseAccountPasswordChangeFormData,
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
});
