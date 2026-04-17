import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { z } from "zod";

const recoveryDeliveryEnvSchema = z.object({
  RECOVERY_DELIVERY_MODE: z.enum(["preview", "file"]).optional(),
  RECOVERY_FILE_OUTBOX_DIR: z.string().trim().min(1).optional(),
});

export type RecoveryDeliveryMode = "preview" | "file";

export type RecoveryDeliveryConfig = {
  mode: RecoveryDeliveryMode;
  outboxDir: string;
};

export type RecoveryDeliveryPayload = {
  login: string;
  email: string;
  resetUrl: string;
  requestedAt: string;
  requestedIp?: string | null;
  requestedUserAgent?: string | null;
};

export type RecoveryDeliveryResult = {
  previewResetUrl?: string;
};

export function getRecoveryDeliveryConfig(): RecoveryDeliveryConfig {
  const parsedEnv = recoveryDeliveryEnvSchema.safeParse({
    RECOVERY_DELIVERY_MODE: process.env.RECOVERY_DELIVERY_MODE,
    RECOVERY_FILE_OUTBOX_DIR: process.env.RECOVERY_FILE_OUTBOX_DIR,
  });

  if (!parsedEnv.success) {
    throw new Error(
      `Invalid recovery delivery configuration: ${JSON.stringify(parsedEnv.error.flatten().fieldErrors)}`,
    );
  }

  const mode =
    parsedEnv.data.RECOVERY_DELIVERY_MODE ??
    (process.env.NODE_ENV === "production" ? "file" : "preview");

  if (mode === "preview" && process.env.NODE_ENV === "production") {
    throw new Error(
      "RECOVERY_DELIVERY_MODE=preview is not allowed in production. Use file mode until a real mail provider is integrated.",
    );
  }

  return {
    mode,
    outboxDir:
      parsedEnv.data.RECOVERY_FILE_OUTBOX_DIR ??
      join(process.cwd(), ".runtime", "recovery-outbox"),
  };
}

function sanitizeLoginForFilename(login: string) {
  const sanitized = login
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return sanitized || "account";
}

function createOutboxFileName(login: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `${timestamp}-${sanitizeLoginForFilename(login)}-${randomUUID()}.json`;
}

export async function deliverPasswordRecoveryLink(
  payload: RecoveryDeliveryPayload,
  config: RecoveryDeliveryConfig = getRecoveryDeliveryConfig(),
): Promise<RecoveryDeliveryResult> {
  if (config.mode === "preview") {
    return {
      previewResetUrl: payload.resetUrl,
    };
  }

  await mkdir(config.outboxDir, { recursive: true });

  const filePath = join(config.outboxDir, createOutboxFileName(payload.login));
  const outboxEntry = {
    kind: "password_recovery",
    deliveryMode: config.mode,
    createdAt: payload.requestedAt,
    login: payload.login,
    email: payload.email,
    requestedIp: payload.requestedIp ?? null,
    requestedUserAgent: payload.requestedUserAgent ?? null,
    resetUrl: payload.resetUrl,
    note:
      "Temporary manual-delivery outbox. An operator must deliver this reset link out-of-band until a real mail provider is integrated.",
  };

  await writeFile(filePath, JSON.stringify(outboxEntry, null, 2), {
    flag: "wx",
  });

  return {};
}
