"use client";

import { AlertCircleIcon, CheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

type CopyState = "idle" | "copied" | "error";

export function DownloadChecksumCopyButton({ checksum }: { checksum: string }) {
  const [copyState, setCopyState] = useState<CopyState>("idle");

  async function handleCopy() {
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      setCopyState("error");
      window.setTimeout(() => {
        setCopyState("idle");
      }, 2000);
      return;
    }

    try {
      await navigator.clipboard.writeText(checksum);
      setCopyState("copied");
      window.setTimeout(() => {
        setCopyState("idle");
      }, 2000);
    } catch {
      setCopyState("error");
      window.setTimeout(() => {
        setCopyState("idle");
      }, 2000);
    }
  }

  return (
    <div
      data-slot="downloads-inline-checksum"
      className="mt-1 flex w-full basis-full flex-col gap-3 rounded-[24px] border border-white/10 bg-black/20 px-4 py-4 text-zinc-300 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="min-w-0 space-y-1">
        <p className="text-[0.72rem] font-medium uppercase tracking-[0.18em] text-zinc-500">
          SHA256
        </p>
        <code className="block overflow-x-auto text-sm leading-6 text-zinc-100 [scrollbar-width:none]">
          {checksum}
        </code>
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        aria-label="Copy SHA256 checksum"
        onClick={handleCopy}
        className="shrink-0 border-white/10 bg-white/5 text-zinc-100 hover:bg-white/10"
      >
        {copyState === "copied" ? (
          <CheckIcon className="size-4" />
        ) : copyState === "error" ? (
          <AlertCircleIcon className="size-4" />
        ) : (
          <CopyIcon className="size-4" />
        )}
        {copyState === "copied"
          ? "Copied"
          : copyState === "error"
            ? "Copy failed"
            : "Copy"}
      </Button>
    </div>
  );
}
