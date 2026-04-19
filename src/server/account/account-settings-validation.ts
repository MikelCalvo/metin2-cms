import { z } from "zod";

import { defaultLocale, type Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import {
  emailValueSchema,
  passwordValueSchema,
  socialIdValueSchema,
} from "@/server/auth/validation";
import type { RequestMetadata } from "@/server/auth/types";

function createAccountPasswordChangeSchema(locale: Locale = defaultLocale) {
  return z
    .object({
      currentPassword: passwordValueSchema(locale),
      newPassword: passwordValueSchema(locale),
      newPasswordConfirmation: passwordValueSchema(locale),
      ip: z.string().nullable().optional(),
      userAgent: z.string().nullable().optional(),
    })
    .superRefine((value, ctx) => {
      if (value.newPassword !== value.newPasswordConfirmation) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: getMessages(locale).validation.passwordsMustMatch,
          path: ["newPasswordConfirmation"],
        });
      }
    });
}

function createAccountProfileSchema(locale: Locale = defaultLocale) {
  return z.object({
    email: emailValueSchema(locale),
    socialId: socialIdValueSchema(locale),
    ip: z.string().nullable().optional(),
    userAgent: z.string().nullable().optional(),
  });
}

function readString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

export function parseAccountPasswordChangeFormData(
  formData: FormData,
  metadata: RequestMetadata = {},
  locale: Locale = defaultLocale,
) {
  return createAccountPasswordChangeSchema(locale).safeParse({
    currentPassword: readString(formData, "currentPassword"),
    newPassword: readString(formData, "newPassword"),
    newPasswordConfirmation: readString(formData, "newPasswordConfirmation"),
    ip: metadata.ip ?? null,
    userAgent: metadata.userAgent ?? null,
  });
}

export function parseAccountProfileFormData(
  formData: FormData,
  metadata: RequestMetadata = {},
  locale: Locale = defaultLocale,
) {
  return createAccountProfileSchema(locale).safeParse({
    email: readString(formData, "email"),
    socialId: readString(formData, "socialId"),
    ip: metadata.ip ?? null,
    userAgent: metadata.userAgent ?? null,
  });
}
