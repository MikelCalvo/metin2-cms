import { z } from "zod";

import { defaultLocale, type Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import {
  emailValueSchema,
  loginValueSchema,
  passwordValueSchema,
} from "@/server/auth/validation";

function recoveryTokenSchema(locale: Locale = defaultLocale) {
  const validation = getMessages(locale).validation;

  return z
    .string()
    .trim()
    .length(64, validation.recoveryTokenLength)
    .regex(/^[a-f0-9]{64}$/i, validation.recoveryTokenFormat);
}

function createRequestRecoverySchema(locale: Locale = defaultLocale) {
  return z.object({
    login: loginValueSchema(locale),
    email: emailValueSchema(locale),
    ip: z.string().nullable().optional(),
    userAgent: z.string().nullable().optional(),
  });
}

function createResetPasswordSchema(locale: Locale = defaultLocale) {
  return z
    .object({
      token: recoveryTokenSchema(locale),
      password: passwordValueSchema(locale),
      passwordConfirmation: passwordValueSchema(locale),
    })
    .superRefine((value, ctx) => {
      if (value.password !== value.passwordConfirmation) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: getMessages(locale).validation.passwordsMustMatch,
          path: ["passwordConfirmation"],
        });
      }
    });
}

function readString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

export function parseRecoveryRequestFormData(
  formData: FormData,
  metadata: { ip?: string | null; userAgent?: string | null } = {},
  locale: Locale = defaultLocale,
) {
  return createRequestRecoverySchema(locale).safeParse({
    login: readString(formData, "login"),
    email: readString(formData, "email"),
    ip: metadata.ip ?? null,
    userAgent: metadata.userAgent ?? null,
  });
}

export function parseResetPasswordFormData(
  formData: FormData,
  locale: Locale = defaultLocale,
) {
  return createResetPasswordSchema(locale).safeParse({
    token: readString(formData, "token"),
    password: readString(formData, "password"),
    passwordConfirmation: readString(formData, "passwordConfirmation"),
  });
}
