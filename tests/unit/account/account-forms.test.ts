import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { useActionStateMock, useFormStatusMock } = vi.hoisted(() => ({
  useActionStateMock: vi.fn(),
  useFormStatusMock: vi.fn(),
}));

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");

  return {
    ...actual,
    useActionState: useActionStateMock,
  };
});

vi.mock("react-dom", async () => {
  const actual = await vi.importActual<typeof import("react-dom")>("react-dom");

  return {
    ...actual,
    useFormStatus: useFormStatusMock,
  };
});

vi.mock("@/app/account/actions", () => ({
  changePasswordAction: vi.fn(),
  updateProfileAction: vi.fn(),
}));

import { ChangePasswordForm } from "@/components/account/change-password-form";
import { ProfileSettingsForm } from "@/components/account/profile-settings-form";

describe("account forms", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useActionStateMock.mockReturnValue([{ status: "idle" }, vi.fn()]);
    useFormStatusMock.mockReturnValue({ pending: false });
  });

  it("renders the simplified profile form copy and fields", () => {
    const html = renderToStaticMarkup(
      createElement(ProfileSettingsForm, {
        login: "mk",
        status: "OK",
        email: "mk@example.test",
        socialId: "1234567",
      }),
    );

    expect(html).toContain("Profile");
    expect(html).toContain("Email and delete code.");
    expect(html).toContain("Login");
    expect(html).toContain('name="email"');
    expect(html).toContain('name="socialId"');
    expect(html).toContain("Save changes");
    expect(html).not.toContain("Profile settings");
    expect(html).not.toContain("Save profile");
    expect(html).not.toContain("Legacy-compatible delete code stored in the live account table");
  });

  it("renders the simplified password form copy and fields", () => {
    const html = renderToStaticMarkup(createElement(ChangePasswordForm));

    expect(html).toContain("Password");
    expect(html).toContain("Changing it closes the other sessions.");
    expect(html).toContain('name="currentPassword"');
    expect(html).toContain('name="newPassword"');
    expect(html).toContain('name="newPasswordConfirmation"');
    expect(html).toContain("Save password");
    expect(html).not.toContain("Password &amp; recovery");
    expect(html).not.toContain("Rotate the legacy-compatible password used by the website and the game.");
    expect(html).not.toContain("Update password");
  });
});
