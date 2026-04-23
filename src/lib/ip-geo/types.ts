export type IpGeoLookup = {
  countryCode: string;
  city?: string | null;
  postalCode?: string | null;
  isp?: string | null;
  timeZone?: string | null;
  source?: string | null;
  proxy?: boolean | null;
  hosting?: boolean | null;
  vpn?: boolean | null;
  tor?: boolean | null;
};
