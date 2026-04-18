export type SiteNavItem = {
  href: string;
  label: string;
};

export const siteNavigationItems = [
  { href: "/", label: "Overview" },
  { href: "/game", label: "Game" },
  { href: "/downloads", label: "Downloads" },
  { href: "/getting-started", label: "Getting started" },
  { href: "/rankings", label: "Rankings" },
] as const satisfies readonly SiteNavItem[];
