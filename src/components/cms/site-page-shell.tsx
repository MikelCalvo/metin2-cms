import type { ReactNode } from "react";

import { CmsPageShell } from "@/components/cms/page-shell";
import { SiteHeader } from "@/components/cms/site-header";
import { cn } from "@/lib/utils";
import { getCurrentAuthenticatedAccount } from "@/server/auth/current-account";

type SitePageShellProps = {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
};

export async function SitePageShell({
  children,
  className,
  containerClassName,
}: SitePageShellProps) {
  let authenticated: Awaited<ReturnType<typeof getCurrentAuthenticatedAccount>> = null;

  try {
    authenticated = await getCurrentAuthenticatedAccount();
  } catch {
    authenticated = null;
  }

  return (
    <CmsPageShell className={className} containerClassName={cn("gap-6 sm:gap-8", containerClassName)}>
      <SiteHeader
        isAuthenticated={Boolean(authenticated)}
        accountLogin={authenticated?.account?.login ?? undefined}
      />
      {children}
    </CmsPageShell>
  );
}
