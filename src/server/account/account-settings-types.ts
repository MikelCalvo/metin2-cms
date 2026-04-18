import type { RequestMetadata } from "@/server/auth/types";

export type AccountPasswordChangeFieldErrors = Partial<
  Record<"currentPassword" | "newPassword" | "newPasswordConfirmation", string[]>
>;

export type AccountProfileFieldErrors = Partial<Record<"email" | "socialId", string[]>>;

export type AccountPasswordChangeActionState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: AccountPasswordChangeFieldErrors;
};

export type AccountProfileActionState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: AccountProfileFieldErrors;
  values?: Partial<Record<"email" | "socialId", string>>;
};

export type ChangeAuthenticatedAccountPasswordInput = RequestMetadata & {
  accountId: number;
  login: string;
  currentSessionId: string;
  currentPassword: string;
  newPassword: string;
};

export type UpdateAuthenticatedAccountProfileInput = RequestMetadata & {
  accountId: number;
  login: string;
  email: string;
  socialId: string;
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

export type UpdateAuthenticatedAccountProfileResult =
  | {
      ok: true;
      message: string;
    }
  | {
      ok: false;
      code: "account_unavailable";
      message: string;
      fieldErrors?: AccountProfileFieldErrors;
    };

export const emptyAccountPasswordChangeActionState: AccountPasswordChangeActionState = {
  status: "idle",
};

export const emptyAccountProfileActionState: AccountProfileActionState = {
  status: "idle",
};
