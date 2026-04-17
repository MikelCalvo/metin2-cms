import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "metin2-cms",
  description:
    "Modern CMS and item shop for Metin2 servers, built with Next.js, TypeScript and SSR.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
