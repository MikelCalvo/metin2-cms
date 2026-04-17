import "server-only";

import { timingSafeEqual } from "node:crypto";

import type { RowDataPacket } from "mysql2/promise";

import { legacyAccountPool } from "@/lib/db/connection";

const LEGACY_PASSWORD_HASH_REGEX = /^\*[0-9A-F]{40}$/;

type PasswordHashRow = RowDataPacket & {
  hash: string | null;
};

export function isLegacyPasswordHash(value: string): boolean {
  return LEGACY_PASSWORD_HASH_REGEX.test(value);
}

export async function hashPasswordWithLegacyAlgorithm(
  password: string,
): Promise<string> {
  const [rows] = await legacyAccountPool.query<PasswordHashRow[]>(
    "SELECT PASSWORD(?) AS hash",
    [password],
  );
  const hash = rows[0]?.hash;

  if (typeof hash !== "string" || !isLegacyPasswordHash(hash)) {
    throw new Error("Legacy password hashing did not return a valid hash.");
  }

  return hash;
}

export async function verifyLegacyPassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  if (!isLegacyPasswordHash(storedHash)) {
    return false;
  }

  const computedHash = await hashPasswordWithLegacyAlgorithm(password);

  if (computedHash.length !== storedHash.length) {
    return false;
  }

  return timingSafeEqual(Buffer.from(computedHash), Buffer.from(storedHash));
}
