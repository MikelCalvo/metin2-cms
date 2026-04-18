"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AuthSubmitButtonProps = {
  idleLabel: string;
  pendingLabel: string;
  className?: string;
};

export function AuthSubmitButton({
  idleLabel,
  pendingLabel,
  className,
}: AuthSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className={cn("min-w-32", className)}>
      {pending ? pendingLabel : idleLabel}
    </Button>
  );
}
