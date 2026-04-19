export type SiteNavItem = {
  href: string;
  label: string;
};

export const siteNavigationItems = [
  { href: "/", label: "Home" },
  { href: "/downloads", label: "Downloads" },
  { href: "/rankings", label: "Rankings" },
] as const satisfies readonly SiteNavItem[];
