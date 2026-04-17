import type { RecoveryActionState, RecoveryFieldErrors } from "@/server/recovery/types";

export function createRecoveryErrorState(options: {
  message: string;
  fieldErrors?: RecoveryFieldErrors;
  values?: RecoveryActionState["values"];
}): RecoveryActionState {
  return {
    status: "error",
    message: options.message,
    fieldErrors: options.fieldErrors,
    values: options.values,
  };
}

export function createRecoverySuccessState(options: {
  message: string;
  values?: RecoveryActionState["values"];
  previewResetUrl?: string;
}): RecoveryActionState {
  return {
    status: "success",
    message: options.message,
    values: options.values,
    previewResetUrl: options.previewResetUrl,
  };
}
