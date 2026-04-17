import "server-only";

const LEGACY_PASSWORD_HASH_REGEX = /^\*[0-9A-F]{40}$/;

export function isLegacyPasswordHash(value: string): boolean {
  return LEGACY_PASSWORD_HASH_REGEX.test(value);
}

export async function hashPasswordWithLegacyAlgorithm(
  _password: string,
): Promise<string> {
  throw new Error(
    "Not implemented: hashPasswordWithLegacyAlgorithm must match the live MariaDB PASSWORD()-style hash behavior.",
  );
}

export async function verifyLegacyPassword(
  _password: string,
  _storedHash: string,
): Promise<boolean> {
  throw new Error(
    "Not implemented: verifyLegacyPassword must compare against the live MariaDB PASSWORD()-style hash behavior.",
  );
}
