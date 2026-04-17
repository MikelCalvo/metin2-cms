import "server-only";

import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  CMS_DATABASE_URL: z.string().url(),
  SESSION_COOKIE_NAME: z.string().min(1).default("mt2cms_session"),
  SESSION_COOKIE_SECURE: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
  APP_BASE_URL: z.string().url(),
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | undefined;

function readRawEnv() {
  return {
    DATABASE_URL: process.env.DATABASE_URL,
    CMS_DATABASE_URL: process.env.CMS_DATABASE_URL,
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

export const env = new Proxy({} as Env, {
  get(_target, property) {
    return getEnv()[property as keyof Env];
  },
});
