import "server-only";

import type { NewLegacyAccount } from "@/lib/db/schema/account";
import {
  createLegacyAccount,
  findAccountByLogin,
} from "@/server/account/account-repository";
import {
  hashPasswordWithLegacyAlgorithm,
  verifyLegacyPassword,
} from "@/server/auth/password-compat";
import type {
  AuthenticateLegacyAccountResult,
  LoginInput,
  RegisterInput,
  RegisterLegacyCompatibleAccountResult,
} from "@/server/auth/types";

function toMysqlDateTime(date: Date) {
  return date.toISOString().slice(0, 19).replace("T", " ");
}

export async function authenticateLegacyAccount(
  input: LoginInput,
): Promise<AuthenticateLegacyAccountResult> {
  const account = await findAccountByLogin(input.login);

  if (!account) {
    return {
      ok: false,
      code: "invalid_credentials",
      message: "Invalid login or password.",
    };
  }

  const passwordMatches = await verifyLegacyPassword(input.password, account.password);

  if (!passwordMatches) {
    return {
      ok: false,
      code: "invalid_credentials",
      message: "Invalid login or password.",
    };
  }

  if (account.status !== "OK") {
    return {
      ok: false,
      code: "account_unavailable",
      message: "This account is not available for login.",
    };
  }

  return {
    ok: true,
    account,
  };
}

export async function registerLegacyCompatibleAccount(
  input: RegisterInput,
): Promise<RegisterLegacyCompatibleAccountResult> {
  const existingAccount = await findAccountByLogin(input.login);

  if (existingAccount) {
    return {
      ok: false,
      code: "login_taken",
      message: "That login is already in use.",
      fieldErrors: {
        login: ["That login is already in use."],
      },
    };
  }

  const passwordHash = await hashPasswordWithLegacyAlgorithm(input.password);
  const now = toMysqlDateTime(new Date());
  const newAccount: NewLegacyAccount = {
    login: input.login,
    password: passwordHash,
    socialId: input.socialId,
    email: input.email,
    createTime: now,
    status: "OK",
  };

  try {
    await createLegacyAccount(newAccount);
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "ER_DUP_ENTRY"
    ) {
      return {
        ok: false,
        code: "login_taken",
        message: "That login is already in use.",
        fieldErrors: {
          login: ["That login is already in use."],
        },
      };
    }

    throw error;
  }

  const createdAccount = await findAccountByLogin(input.login);

  if (!createdAccount) {
    return {
      ok: false,
      code: "registration_failed",
      message: "The account could not be created.",
    };
  }

  return {
    ok: true,
    account: createdAccount,
  };
}
