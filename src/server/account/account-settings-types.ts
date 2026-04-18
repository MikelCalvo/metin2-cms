import type { RequestMetadata } from "@/server/auth/types";

export type AccountPasswordChangeFieldErrors = Partial<
  Record<"currentPassword" | "newPassword" | "newPasswordConfirmation", string[]>
>;

export type AccountPasswordChangeActionState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: AccountPasswordChangeFieldErrors;
};

export type ChangeAuthenticatedAccountPasswordInput = RequestMetadata & {
  accountId: number;
  login: string;
  currentSessionId: string;
  currentPassword: string;
  newPassword: string;
};

export type ChangeAuthenticatedAccountPasswordResult =
  | {
      ok: true;
      message: string;
    }
  | {
      ok: false;
      code: "invalid_current_password" | "account_unavailable";
      message: string;
      fieldErrors?: AccountPasswordChangeFieldErrors;
    };

export const emptyAccountPasswordChangeActionState: AccountPasswordChangeActionState = {
  status: "idle",
};
