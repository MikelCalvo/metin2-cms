import { z } from "zod";

import { passwordValueSchema } from "@/server/auth/validation";
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
