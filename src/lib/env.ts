import "server-only";

import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  CMS_DATABASE_URL: z.string().url(),
  PLAYER_DATABASE_URL: z.string().url().optional(),
  SESSION_COOKIE_NAME: z.string().min(1).default("mt2cms_session"),
  SESSION_COOKIE_SECURE: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
  APP_BASE_URL: z.string().url(),
});

export type Env = z.infer<typeof envSchema>;

const publicEnvSchema = z.object({
  STARTER_PACK_URL: z.string().url().optional(),
  STARTER_PACK_SHA256: z.string().min(1).optional(),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;

const downloadsEnvSchema = z
  .object({
    STARTER_PACK_URL: z.string().url().optional(),
    STARTER_PACK_USERNAME: z.string().min(1).optional(),
    STARTER_PACK_PASSWORD: z.string().min(1).optional(),
  })
  .superRefine((env, context) => {
    const hasUsername = Boolean(env.STARTER_PACK_USERNAME);
    const hasPassword = Boolean(env.STARTER_PACK_PASSWORD);

    if (hasUsername !== hasPassword) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "STARTER_PACK_USERNAME and STARTER_PACK_PASSWORD must be configured together",
        path: hasUsername ? ["STARTER_PACK_PASSWORD"] : ["STARTER_PACK_USERNAME"],
      });
    }
  });

export type DownloadsEnv = z.infer<typeof downloadsEnvSchema>;

let cachedEnv: Env | undefined;
let cachedPublicEnv: PublicEnv | undefined;
let cachedDownloadsEnv: DownloadsEnv | undefined;

function readRawEnv() {
  return {
    DATABASE_URL: process.env.DATABASE_URL,
    CMS_DATABASE_URL: process.env.CMS_DATABASE_URL,
    PLAYER_DATABASE_URL: process.env.PLAYER_DATABASE_URL,
    SESSION_COOKIE_NAME: process.env.SESSION_COOKIE_NAME,
    SESSION_COOKIE_SECURE: process.env.SESSION_COOKIE_SECURE,
    APP_BASE_URL: process.env.APP_BASE_URL,
  };
}

export function getEnv(): Env {
  if (cachedEnv) {
    return cachedEnv;
  }

  const parsedEnv = envSchema.safeParse(readRawEnv());

  if (!parsedEnv.success) {
    throw new Error(
      `Invalid environment configuration: ${JSON.stringify(parsedEnv.error.flatten().fieldErrors)}`,
    );
  }

  cachedEnv = parsedEnv.data;
  return cachedEnv;
}

export function getPublicEnv(): PublicEnv {
  if (cachedPublicEnv) {
    return cachedPublicEnv;
  }

  const parsedEnv = publicEnvSchema.safeParse({
    STARTER_PACK_URL: process.env.STARTER_PACK_URL,
    STARTER_PACK_SHA256: process.env.STARTER_PACK_SHA256,
  });

  if (!parsedEnv.success) {
    throw new Error(
      `Invalid public environment configuration: ${JSON.stringify(parsedEnv.error.flatten().fieldErrors)}`,
    );
  }

  cachedPublicEnv = parsedEnv.data;
  return cachedPublicEnv;
}

export function getDownloadsEnv(): DownloadsEnv {
  if (cachedDownloadsEnv) {
    return cachedDownloadsEnv;
  }

  const parsedEnv = downloadsEnvSchema.safeParse({
    STARTER_PACK_URL: process.env.STARTER_PACK_URL,
    STARTER_PACK_USERNAME: process.env.STARTER_PACK_USERNAME,
    STARTER_PACK_PASSWORD: process.env.STARTER_PACK_PASSWORD,
  });

  if (!parsedEnv.success) {
    throw new Error(
      `Invalid downloads environment configuration: ${JSON.stringify(parsedEnv.error.flatten().fieldErrors)}`,
    );
  }

  cachedDownloadsEnv = parsedEnv.data;
  return cachedDownloadsEnv;
}

export const env = new Proxy({} as Env, {
  get(_target, property) {
    return getEnv()[property as keyof Env];
  },
});
