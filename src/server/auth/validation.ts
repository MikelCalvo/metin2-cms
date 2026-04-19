import { z } from "zod";

import { defaultLocale, type Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import type { RequestMetadata } from "@/server/auth/types";

export const LOGIN_MIN_LENGTH = 4;
export const LOGIN_MAX_LENGTH = 16;
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 16;
export const SOCIAL_ID_MIN_LENGTH = 7;
export const SOCIAL_ID_MAX_LENGTH = 13;

export function loginValueSchema(locale: Locale = defaultLocale) {
  const validation = getMessages(locale).validation;

  return z
    .string()
    .trim()
    .min(LOGIN_MIN_LENGTH, validation.loginMin(LOGIN_MIN_LENGTH))
    .max(LOGIN_MAX_LENGTH, validation.loginMax(LOGIN_MAX_LENGTH))
    .regex(/^[A-Za-z0-9]+$/, validation.loginAlphanumeric);
}

export function passwordValueSchema(locale: Locale = defaultLocale) {
  const validation = getMessages(locale).validation;

  return z
    .string()
    .min(PASSWORD_MIN_LENGTH, validation.passwordMin(PASSWORD_MIN_LENGTH))
    .max(PASSWORD_MAX_LENGTH, validation.passwordMax(PASSWORD_MAX_LENGTH))
    .regex(/^[A-Za-z0-9]+$/, validation.passwordAlphanumeric);
}

export function socialIdValueSchema(locale: Locale = defaultLocale) {
  const validation = getMessages(locale).validation;

  return z
    .string()
    .trim()
    .min(SOCIAL_ID_MIN_LENGTH, validation.socialIdMin(SOCIAL_ID_MIN_LENGTH))
    .max(SOCIAL_ID_MAX_LENGTH, validation.socialIdMax(SOCIAL_ID_MAX_LENGTH))
    .regex(/^[A-Za-z0-9]+$/, validation.socialIdAlphanumeric);
}

export function emailValueSchema(locale: Locale = defaultLocale) {
  const validation = getMessages(locale).validation;

  return z
    .string()
    .trim()
    .email(validation.emailInvalid)
    .max(64, validation.emailMax);
}

function createLoginSchema(locale: Locale = defaultLocale) {
  return z.object({
    login: loginValueSchema(locale),
    password: passwordValueSchema(locale),
    ip: z.string().nullable().optional(),
    userAgent: z.string().nullable().optional(),
  });
}

function createRegisterSchema(locale: Locale = defaultLocale) {
  return z
    .object({
      login: loginValueSchema(locale),
      email: emailValueSchema(locale),
      password: passwordValueSchema(locale),
      passwordConfirmation: passwordValueSchema(locale),
      socialId: socialIdValueSchema(locale),
      ip: z.string().nullable().optional(),
      userAgent: z.string().nullable().optional(),
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

export function parseLoginFormData(
  formData: FormData,
  metadata: RequestMetadata = {},
  locale: Locale = defaultLocale,
) {
  return createLoginSchema(locale).safeParse({
    login: readString(formData, "login"),
    password: readString(formData, "password"),
    ip: metadata.ip ?? null,
    userAgent: metadata.userAgent ?? null,
  });
}

export function parseRegisterFormData(
  formData: FormData,
  metadata: RequestMetadata = {},
  locale: Locale = defaultLocale,
) {
  return createRegisterSchema(locale).safeParse({
    login: readString(formData, "login"),
    email: readString(formData, "email"),
    password: readString(formData, "password"),
    passwordConfirmation: readString(formData, "passwordConfirmation"),
    socialId: readString(formData, "socialId"),
    ip: metadata.ip ?? null,
    userAgent: metadata.userAgent ?? null,
  });
}
