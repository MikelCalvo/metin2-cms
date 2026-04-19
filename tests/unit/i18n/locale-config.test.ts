import { describe, expect, it } from "vitest";

import {
  defaultLocale,
  resolveLocale,
  supportedLocaleCodes,
  supportedLocales,
} from "@/lib/i18n/config";

describe("locale config", () => {
  it("supports the historical Metin2 locales chosen for the CMS", () => {
    expect(supportedLocaleCodes).toEqual([
      "en",
      "de",
      "es",
      "fr",
      "it",
      "tr",
      "pl",
      "pt",
      "ro",
      "cs",
      "hu",
    ]);

    expect(supportedLocales.find((locale) => locale.code === "tr")).toMatchObject({
      flag: "🇹🇷",
      nativeName: "Türkçe",
    });
    expect(supportedLocales.find((locale) => locale.code === "de")).toMatchObject({
      flag: "🇩🇪",
      nativeName: "Deutsch",
    });
  });

  it("falls back to english when the cookie contains an unsupported locale", () => {
    expect(resolveLocale("ru")).toBe(defaultLocale);
    expect(resolveLocale(undefined)).toBe(defaultLocale);
  });
});
