import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  headersMock,
  redirectMock,
  authenticateLegacyAccountMock,
  registerLegacyCompatibleAccountMock,
  requestPasswordRecoveryMock,
  resetPasswordWithRecoveryTokenMock,
  issueAuthenticatedSessionMock,
  clearAuthenticatedSessionMock,
} = vi.hoisted(() => ({
  headersMock: vi.fn(),
  redirectMock: vi.fn(),
  authenticateLegacyAccountMock: vi.fn(),
  registerLegacyCompatibleAccountMock: vi.fn(),
  requestPasswordRecoveryMock: vi.fn(),
  resetPasswordWithRecoveryTokenMock: vi.fn(),
  issueAuthenticatedSessionMock: vi.fn(),
  clearAuthenticatedSessionMock: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: headersMock,
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("@/server/account/account-service", () => ({
  authenticateLegacyAccount: authenticateLegacyAccountMock,
  registerLegacyCompatibleAccount: registerLegacyCompatibleAccountMock,
}));

vi.mock("@/server/recovery/recovery-service", () => ({
  requestPasswordRecovery: requestPasswordRecoveryMock,
  resetPasswordWithRecoveryToken: resetPasswordWithRecoveryTokenMock,
}));

vi.mock("@/server/session/session-service", () => ({
  issueAuthenticatedSession: issueAuthenticatedSessionMock,
  clearAuthenticatedSession: clearAuthenticatedSessionMock,
}));

import {
  loginAction,
  logoutAction,
  registerAction,
  requestRecoveryAction,
  resetPasswordAction,
} from "@/app/auth/actions";
import { emptyAuthActionState } from "@/server/auth/types";
import { emptyRecoveryActionState } from "@/server/recovery/types";

function createFormData(entries: Array<[string, string]>) {
  const formData = new FormData();

  for (const [key, value] of entries) {
    formData.set(key, value);
  }

  return formData;
}

describe("auth actions", () => {
  beforeEach(() => {
    headersMock.mockReset();
    redirectMock.mockReset();
    authenticateLegacyAccountMock.mockReset();
    registerLegacyCompatibleAccountMock.mockReset();
    requestPasswordRecoveryMock.mockReset();
    resetPasswordWithRecoveryTokenMock.mockReset();
    issueAuthenticatedSessionMock.mockReset();
    clearAuthenticatedSessionMock.mockReset();
    headersMock.mockResolvedValue({
      get: (name: string) => {
        if (name === "x-forwarded-for") {
          return "127.0.0.1";
        }

        if (name === "user-agent") {
          return "Vitest";
        }

        return null;
      },
    });
    redirectMock.mockImplementation(() => {
      throw new Error("NEXT_REDIRECT");
    });
  });

  it("returns validation errors for an invalid login payload", async () => {
    const result = await loginAction(
      emptyAuthActionState,
      createFormData([
        ["login", "bad-user"],
        ["password", "abc12345"],
      ]),
    );

    expect(result.status).toBe("error");
    expect(result.fieldErrors?.login).toBeDefined();
    expect(authenticateLegacyAccountMock).not.toHaveBeenCalled();
  });

  it("creates a session and redirects on successful login", async () => {
    authenticateLegacyAccountMock.mockResolvedValueOnce({
      ok: true,
      account: {
        id: 7,
        login: "tester01",
      },
    });

    await expect(
      loginAction(
        emptyAuthActionState,
        createFormData([
          ["login", "tester01"],
          ["password", "abc12345"],
        ]),
      ),
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(issueAuthenticatedSessionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        accountId: 7,
        login: "tester01",
        ip: "127.0.0.1",
        userAgent: "Vitest",
      }),
    );
    expect(redirectMock).toHaveBeenCalledWith("/account");
  });

  it("returns a service error when registration fails", async () => {
    registerLegacyCompatibleAccountMock.mockResolvedValueOnce({
      ok: false,
      code: "login_taken",
      message: "That login is already in use.",
      fieldErrors: {
        login: ["That login is already in use."],
      },
    });

    const result = await registerAction(
      emptyAuthActionState,
      createFormData([
        ["login", "tester01"],
        ["email", "tester@example.com"],
        ["password", "abc12345"],
        ["passwordConfirmation", "abc12345"],
        ["socialId", "1234567"],
      ]),
    );

    expect(result.status).toBe("error");
    expect(result.fieldErrors?.login).toEqual(["That login is already in use."]);
  });

  it("returns a success state when recovery is requested", async () => {
    requestPasswordRecoveryMock.mockResolvedValueOnce({
      ok: true,
      message: "If the login and email match an account, a reset link has been created.",
      previewResetUrl: "http://localhost:3000/reset-password?token=abc",
    });

    const result = await requestRecoveryAction(
      emptyRecoveryActionState,
      createFormData([
        ["login", "tester01"],
        ["email", "tester@example.com"],
      ]),
    );

    expect(result.status).toBe("success");
    expect(result.previewResetUrl).toContain("/reset-password?token=");
    expect(requestPasswordRecoveryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        login: "tester01",
        email: "tester@example.com",
        ip: "127.0.0.1",
        userAgent: "Vitest",
      }),
    );
  });

  it("redirects to login after a successful password reset", async () => {
    resetPasswordWithRecoveryTokenMock.mockResolvedValueOnce({
      ok: true,
      message: "Password updated successfully.",
    });

    await expect(
      resetPasswordAction(
        emptyRecoveryActionState,
        createFormData([
          ["token", "a".repeat(64)],
          ["password", "abc12345"],
          ["passwordConfirmation", "abc12345"],
        ]),
      ),
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(redirectMock).toHaveBeenCalledWith("/login?recovery=success");
  });

  it("clears the session and redirects on logout", async () => {
    await expect(logoutAction()).rejects.toThrow("NEXT_REDIRECT");

    expect(clearAuthenticatedSessionMock).toHaveBeenCalledOnce();
    expect(redirectMock).toHaveBeenCalledWith("/login");
  });
});
