import type { Metadata } from "next";
import { Geist } from "next/font/google";

import { I18nProvider } from "@/components/i18n/i18n-provider";
import { LocaleSwitcher } from "@/components/i18n/locale-switcher";
import { getCurrentLocale } from "@/lib/i18n/server";
import { cn } from "@/lib/utils";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "metin2-cms",
  description:
    "Modern CMS and item shop for Metin2 servers, built with Next.js, TypeScript and SSR.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getCurrentLocale();

  return (
    <html lang={locale} className={cn("font-sans", geist.variable)}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <I18nProvider locale={locale}>
          <LocaleSwitcher />
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
