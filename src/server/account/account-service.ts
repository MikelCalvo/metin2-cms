import "server-only";

import type { LegacyAccount } from "@/lib/db/schema/account";

import type { LoginInput, RegisterInput } from "@/server/auth/types";

export async function authenticateLegacyAccount(
  _input: LoginInput,
): Promise<LegacyAccount> {
  throw new Error(
    "Not implemented: authenticateLegacyAccount will validate credentials against the legacy MariaDB PASSWORD()-style hash format.",
  );
}

export async function registerLegacyCompatibleAccount(
  _input: RegisterInput,
): Promise<void> {
  throw new Error(
    "Not implemented: registerLegacyCompatibleAccount will create rows compatible with the live account.account schema.",
  );
}
