import { z } from "zod";

import {
  emailValueSchema,
  loginValueSchema,
  passwordValueSchema,
} from "@/server/auth/validation";

const recoveryTokenSchema = z
  .string()
  .trim()
  .length(64, "Recovery token must be 64 characters.")
  .regex(/^[a-f0-9]{64}$/i, "Recovery token format is invalid.");

const requestRecoverySchema = z.object({
  login: loginValueSchema,
  email: emailValueSchema,
  ip: z.string().nullable().optional(),
  userAgent: z.string().nullable().optional(),
});

const resetPasswordSchema = z
  .object({
    token: recoveryTokenSchema,
    password: passwordValueSchema,
    passwordConfirmation: passwordValueSchema,
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

export function parseRecoveryRequestFormData(
  formData: FormData,
  metadata: { ip?: string | null; userAgent?: string | null } = {},
) {
  return requestRecoverySchema.safeParse({
    login: readString(formData, "login"),
    email: readString(formData, "email"),
    ip: metadata.ip ?? null,
    userAgent: metadata.userAgent ?? null,
  });
}

export function parseResetPasswordFormData(formData: FormData) {
  return resetPasswordSchema.safeParse({
    token: readString(formData, "token"),
    password: readString(formData, "password"),
    passwordConfirmation: readString(formData, "passwordConfirmation"),
  });
}
