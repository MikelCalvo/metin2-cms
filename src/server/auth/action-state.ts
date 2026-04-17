import type { AuthActionState, AuthFieldErrors } from "@/server/auth/types";

export function createAuthErrorState(options: {
  message: string;
  fieldErrors?: AuthFieldErrors;
  values?: AuthActionState["values"];
}): AuthActionState {
  return {
    status: "error",
    message: options.message,
    fieldErrors: options.fieldErrors,
    values: options.values,
  };
}
