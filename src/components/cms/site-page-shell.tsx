import type { ReactNode } from "react";

import { CmsPageShell } from "@/components/cms/page-shell";
import { SiteFooter } from "@/components/cms/site-footer";
import { SiteHeader } from "@/components/cms/site-header";
import { cn } from "@/lib/utils";

type SitePageShellProps = {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
};

export function SitePageShell({
  children,
  className,
  containerClassName,
}: SitePageShellProps) {
  return (
    <CmsPageShell className={className} containerClassName={cn("gap-8", containerClassName)}>
      <SiteHeader />
      {children}
      <SiteFooter />
    </CmsPageShell>
  );
}
