import type { Locale } from "@/lib/i18n/config";
import type { IpGeoLookup } from "@/lib/ip-geo/types";

export function countryCodeToFlagEmoji(countryCode: string | null | undefined) {
  if (!countryCode || !/^[A-Z]{2}$/.test(countryCode)) {
    return null;
  }

  return String.fromCodePoint(...countryCode.split("").map((character) => 127397 + character.charCodeAt(0)));
}

export function formatFlaggedIp(
  ip: string | null | undefined,
  countryCode: string | null | undefined,
) {
  const trimmedIp = ip?.trim();

  if (!trimmedIp) {
    return null;
  }

  const flagEmoji = countryCodeToFlagEmoji(countryCode);

  return flagEmoji ? `${flagEmoji} ${trimmedIp}` : trimmedIp;
}

export function formatIpGeoLocation(ipGeo: IpGeoLookup | null | undefined, locale: Locale) {
  if (!ipGeo) {
    return null;
  }

  const city = ipGeo.city?.trim() || null;

  if (!ipGeo.countryCode || !/^[A-Z]{2}$/.test(ipGeo.countryCode)) {
    return city;
  }

  try {
    const countryName = new Intl.DisplayNames([locale], { type: "region" }).of(ipGeo.countryCode) ?? ipGeo.countryCode;

    if (city) {
      return `${city}, ${countryName}`;
    }

    return countryName;
  } catch {
    return city ?? ipGeo.countryCode;
  }
}
