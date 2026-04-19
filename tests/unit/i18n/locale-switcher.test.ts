import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");

  return {
    ...actual,
    useEffect: vi.fn(),
  };
});

import { I18nProvider } from "@/components/i18n/i18n-provider";
import { LocaleSwitcher } from "@/components/i18n/locale-switcher";

describe("locale switcher", () => {
  it("renders a hidden dropdown panel with dismissible semantics ready for outside-click handling", () => {
    const html = renderToStaticMarkup(
      createElement(I18nProvider, { locale: "en" }, createElement(LocaleSwitcher)),
    );

    expect(html).toContain('data-slot="locale-switcher-trigger"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('data-slot="locale-switcher-dropdown"');
    expect(html).toContain('class="absolute top-[calc(100%+0.75rem)] right-0 z-50');
    expect(html).toContain('role="menuitemradio"');
    expect(html).toContain('aria-checked="true"');
  });
});
