import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/ui/accordion", () => ({
  Accordion: ({ children }: { children?: ReactNode }) => createElement("div", null, children),
  AccordionItem: ({ children }: { children?: ReactNode }) => createElement("div", null, children),
  AccordionTrigger: ({ children }: { children?: ReactNode }) => createElement("div", null, children),
  AccordionContent: ({ children }: { children?: ReactNode }) => createElement("div", null, children),
}));

import { ActivityRow } from "@/components/account/activity-row";
import { I18nProvider } from "@/components/i18n/i18n-provider";

describe("activity row", () => {
  it("renders the flagged IP inline and exposes IP information inside event details", () => {
    const html = renderToStaticMarkup(
      createElement(
        I18nProvider,
        { locale: "en" },
        createElement(ActivityRow, {
          entry: {
            id: 91,
            eventType: "login",
            outcome: "authenticated",
            outcomeLabel: "Authenticated",
            occurredAt: "2026-04-18 10:30:00",
            success: true,
            ip: "79.117.198.137",
            userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/135.0.0.0 Safari/537.36",
            deliveryMode: null,
            deliveryModeLabel: null,
            title: "Successful sign-in",
            description: "The account signed in successfully.",
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

  it("sanitizes raw activity text before rendering event details", () => {
    const html = renderToStaticMarkup(
      createElement(
        I18nProvider,
        { locale: "en" },
        createElement(ActivityRow, {
          entry: {
            id: 92,
            eventType: "login",
            outcome: "<b>bad</b>",
            outcomeLabel: "<b>bad</b>",
            occurredAt: "2026-04-18 10:30:00",
            success: false,
            ip: "79.117.198.137",
            userAgent: "Launcher\n<svg onload=alert(1)>",
            deliveryMode: "<img src=x onerror=1>",
            deliveryModeLabel: "<img src=x onerror=1>",
            title: "<script>alert(1)</script>",
            description: "Guild\n<iframe>",
          },
          ipGeo: null,
        }),
      ),
    );

    expect(html).toContain("‹script›alert(1)‹/script›");
    expect(html).toContain("Guild ‹iframe›");
    expect(html).toContain("Launcher ‹svg onload=alert(1)›");
    expect(html).toContain("‹img src=x onerror=1›");
    expect(html).toContain("‹b›bad‹/b›");
  });
});
