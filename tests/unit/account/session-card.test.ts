import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/app/account/actions", () => ({
  revokeSessionAction: vi.fn(),
}));

vi.mock("@/components/ui/accordion", () => ({
  Accordion: ({ children }: { children?: ReactNode }) => createElement("div", null, children),
  AccordionItem: ({ children }: { children?: ReactNode }) => createElement("div", null, children),
  AccordionTrigger: ({ children }: { children?: ReactNode }) => createElement("div", null, children),
  AccordionContent: ({ children }: { children?: ReactNode }) => createElement("div", null, children),
}));

import { SessionCard } from "@/components/account/session-card";
import { I18nProvider } from "@/components/i18n/i18n-provider";

describe("session card", () => {
  it("renders the flagged IP inline and shows an IP information block inside advanced details", () => {
    const html = renderToStaticMarkup(
      createElement(
        I18nProvider,
        { locale: "en" },
        createElement(SessionCard, {
          isCurrent: false,
          session: {
            id: "session-79",
            createdAt: "2026-04-18 10:00:00",
            lastSeenAt: "2026-04-18 10:30:00",
            ip: "79.117.198.137",
            userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/135.0.0.0 Safari/537.36",
          },
          ipGeo: {
            countryCode: "ES",
            city: "Madrid",
            postalCode: "28001",
            timeZone: "Europe/Madrid",
            isp: "Telefonica",
            source: "ipapi.co",
          },
        }),
      ),
    );

    expect(html).toContain("🇪🇸 79.117.198.137");
    expect(html).toContain("IP information");
    expect(html).toContain("Madrid, Spain");
    expect(html).toContain("28001");
    expect(html).toContain("Europe/Madrid");
    expect(html).toContain("Telefonica");
    expect(html).toContain("ipapi.co");
  });

  it("sanitizes raw user agent strings before rendering technical details", () => {
    const html = renderToStaticMarkup(
      createElement(
        I18nProvider,
        { locale: "en" },
        createElement(SessionCard, {
          isCurrent: false,
          session: {
            id: "session-80",
            createdAt: "2026-04-18 10:00:00",
            lastSeenAt: "2026-04-18 10:30:00",
            ip: "79.117.198.137",
            userAgent: "Launcher\n<svg onload=alert(1)>",
          },
          ipGeo: null,
        }),
      ),
    );

    expect(html).toContain("Launcher ‹svg onload=alert(1)›");
    expect(html).not.toContain("&lt;svg onload=alert(1)&gt;");
  });
});
