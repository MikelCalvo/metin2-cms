import { z } from "zod";

import type { RequestMetadata } from "@/server/auth/types";

export const LOGIN_MIN_LENGTH = 4;
export const LOGIN_MAX_LENGTH = 16;
export const PASSWORD_MIN_LENGTH = 4;
export const PASSWORD_MAX_LENGTH = 16;
export const SOCIAL_ID_MIN_LENGTH = 7;
export const SOCIAL_ID_MAX_LENGTH = 13;

const loginValueSchema = z
  .string()
  .trim()
  .min(LOGIN_MIN_LENGTH, `Login must be at least ${LOGIN_MIN_LENGTH} characters.`)
  .max(LOGIN_MAX_LENGTH, `Login must be at most ${LOGIN_MAX_LENGTH} characters.`)
  .regex(/^[A-Za-z0-9]+$/, "Login must use only letters and numbers.");

const passwordValueSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`)
  .max(PASSWORD_MAX_LENGTH, `Password must be at most ${PASSWORD_MAX_LENGTH} characters.`)
  .regex(/^[A-Za-z0-9]+$/, "Password must use only letters and numbers.");

const socialIdValueSchema = z
  .string()
  .trim()
  .min(
    SOCIAL_ID_MIN_LENGTH,
    `Delete code must be at least ${SOCIAL_ID_MIN_LENGTH} characters.`,
  )
  .max(
    SOCIAL_ID_MAX_LENGTH,
    `Delete code must be at most ${SOCIAL_ID_MAX_LENGTH} characters.`,
  )
  .regex(/^[A-Za-z0-9]+$/, "Delete code must use only letters and numbers.");

const emailValueSchema = z
  .string()
  .trim()
  .email("Email must be a valid email address.")
  .max(64, "Email must be at most 64 characters.");

const loginSchema = z.object({
  login: loginValueSchema,
  password: passwordValueSchema,
  ip: z.string().nullable().optional(),
  userAgent: z.string().nullable().optional(),
});

const registerSchema = z
  .object({
    login: loginValueSchema,
    email: emailValueSchema,
    password: passwordValueSchema,
    passwordConfirmation: passwordValueSchema,
    socialId: socialIdValueSchema,
    ip: z.string().nullable().optional(),
    userAgent: z.string().nullable().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.password !== value.passwordConfirmation) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords must match.",
        path: ["passwordConfirmation"],
      });
    }
  });

function readString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

export function parseLoginFormData(
  formData: FormData,
  metadata: RequestMetadata = {},
) {
  return loginSchema.safeParse({
    login: readString(formData, "login"),
    password: readString(formData, "password"),
    ip: metadata.ip ?? null,
    userAgent: metadata.userAgent ?? null,
  });
}

export function parseRegisterFormData(
  formData: FormData,
  metadata: RequestMetadata = {},
) {
  return registerSchema.safeParse({
    login: readString(formData, "login"),
    email: readString(formData, "email"),
    password: readString(formData, "password"),
    passwordConfirmation: readString(formData, "passwordConfirmation"),
    socialId: readString(formData, "socialId"),
    ip: metadata.ip ?? null,
    userAgent: metadata.userAgent ?? null,
  });
}
