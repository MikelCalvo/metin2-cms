import { z } from "zod";

import {
  emailValueSchema,
  passwordValueSchema,
  socialIdValueSchema,
} from "@/server/auth/validation";
import type { RequestMetadata } from "@/server/auth/types";

const accountPasswordChangeSchema = z
  .object({
    currentPassword: passwordValueSchema,
    newPassword: passwordValueSchema,
    newPasswordConfirmation: passwordValueSchema,
    ip: z.string().nullable().optional(),
    userAgent: z.string().nullable().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.newPassword !== value.newPasswordConfirmation) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords must match.",
        path: ["newPasswordConfirmation"],
      });
    }
  });

const accountProfileSchema = z.object({
  email: emailValueSchema,
  socialId: socialIdValueSchema,
  ip: z.string().nullable().optional(),
  userAgent: z.string().nullable().optional(),
});

function readString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

export function parseAccountPasswordChangeFormData(
  formData: FormData,
  metadata: RequestMetadata = {},
) {
  return accountPasswordChangeSchema.safeParse({
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
) {
  return accountProfileSchema.safeParse({
    email: readString(formData, "email"),
    socialId: readString(formData, "socialId"),
    ip: metadata.ip ?? null,
    userAgent: metadata.userAgent ?? null,
  });
}
