export type RecoveryRequestInput = {
  login: string;
  email: string;
  ip?: string | null;
  userAgent?: string | null;
};

export type PasswordResetInput = {
  token: string;
  password: string;
  passwordConfirmation: string;
};

export type RecoveryFieldErrors = Partial<
  Record<"login" | "email" | "token" | "password" | "passwordConfirmation", string[]>
>;

export type RecoveryActionState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: RecoveryFieldErrors;
  values?: Partial<Record<"login" | "email" | "token", string>>;
  previewResetUrl?: string;
};

export type RequestPasswordRecoveryResult = {
  ok: true;
  message: string;
  previewResetUrl?: string;
};

export type ResetPasswordWithRecoveryTokenResult =
  | {
      ok: true;
      message: string;
    }
  | {
      ok: false;
      code: "invalid_or_expired_token";
      message: string;
      fieldErrors?: RecoveryFieldErrors;
    };

export const emptyRecoveryActionState: RecoveryActionState = {
  status: "idle",
};
