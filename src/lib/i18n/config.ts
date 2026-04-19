export const localeCookieName = "mt2-locale";
export const defaultLocale = "en" as const;

export const supportedLocales = [
  {
    code: "en",
    flag: "🇬🇧",
    nativeName: "English",
    countryName: "United Kingdom",
    intlLocale: "en-GB",
  },
  {
    code: "de",
    flag: "🇩🇪",
    nativeName: "Deutsch",
    countryName: "Deutschland",
    intlLocale: "de-DE",
  },
  {
    code: "es",
    flag: "🇪🇸",
    nativeName: "Español",
    countryName: "España",
    intlLocale: "es-ES",
  },
  {
    code: "fr",
    flag: "🇫🇷",
    nativeName: "Français",
    countryName: "France",
    intlLocale: "fr-FR",
  },
  {
    code: "it",
    flag: "🇮🇹",
    nativeName: "Italiano",
    countryName: "Italia",
    intlLocale: "it-IT",
  },
  {
    code: "tr",
    flag: "🇹🇷",
    nativeName: "Türkçe",
    countryName: "Türkiye",
    intlLocale: "tr-TR",
  },
  {
    code: "pl",
    flag: "🇵🇱",
    nativeName: "Polski",
    countryName: "Polska",
    intlLocale: "pl-PL",
  },
  {
    code: "pt",
    flag: "🇵🇹",
    nativeName: "Português",
    countryName: "Portugal",
    intlLocale: "pt-PT",
  },
  {
    code: "ro",
    flag: "🇷🇴",
    nativeName: "Română",
    countryName: "România",
    intlLocale: "ro-RO",
  },
  {
    code: "cs",
    flag: "🇨🇿",
    nativeName: "Čeština",
    countryName: "Česko",
    intlLocale: "cs-CZ",
  },
  {
    code: "hu",
    flag: "🇭🇺",
    nativeName: "Magyar",
    countryName: "Magyarország",
    intlLocale: "hu-HU",
  },
] as const;

export type Locale = (typeof supportedLocales)[number]["code"];

export const supportedLocaleCodes = supportedLocales.map((locale) => locale.code) as Locale[];

export function isLocale(value: string | null | undefined): value is Locale {
  return supportedLocaleCodes.includes(value as Locale);
}

export function resolveLocale(value: string | null | undefined): Locale {
  if (isLocale(value)) {
    return value;
  }

  return defaultLocale;
}

export function getLocaleMeta(locale: Locale) {
  return supportedLocales.find((entry) => entry.code === locale) ?? supportedLocales[0];
}

export function getIntlLocale(locale: Locale) {
  return getLocaleMeta(locale).intlLocale;
}
