"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

import { defaultLocale, type Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";

const I18nContext = createContext<Locale>(defaultLocale);

export function I18nProvider({
  locale,
  children,
}: {
  locale: Locale;
  children?: ReactNode;
}) {
  return <I18nContext.Provider value={locale}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const locale = useContext(I18nContext);
  const messages = useMemo(() => getMessages(locale), [locale]);

  return { locale, messages };
}
