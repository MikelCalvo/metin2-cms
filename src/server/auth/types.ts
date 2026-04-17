import type { LegacyAccount } from "@/lib/db/schema/account";

export type RequestMetadata = {
  ip?: string | null;
  userAgent?: string | null;
};

export type LoginInput = RequestMetadata & {
  login: string;
  password: string;
};

export type RegisterInput = RequestMetadata & {
  login: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  socialId: string;
};

export type IssueSessionInput = RequestMetadata & {
  accountId: number;
  login: string;
};

export type SessionContext = IssueSessionInput & {
  id: string;
  createdAt: string;
  lastSeenAt: string;
  expiresAt: string;
};

export type AuthFieldErrors = Partial<
  Record<"login" | "email" | "password" | "passwordConfirmation" | "socialId", string[]>
>;

export type AuthActionState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: AuthFieldErrors;
  values?: Partial<
    Record<"login" | "email" | "socialId", string>
  >;
};

export type AuthenticateLegacyAccountResult =
  | {
      ok: true;
      account: LegacyAccount;
    }
  | {
      ok: false;
      code: "invalid_credentials" | "account_unavailable";
      message: string;
    };

export type RegisterLegacyCompatibleAccountResult =
  | {
      ok: true;
      account: LegacyAccount;
    }
  | {
      ok: false;
      code: "login_taken" | "registration_failed";
      message: string;
      fieldErrors?: AuthFieldErrors;
    };

export const emptyAuthActionState: AuthActionState = {
  status: "idle",
};
