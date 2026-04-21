import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { AccountCharacterCard } from "@/components/account/account-character-card";

describe("account character card", () => {
  it("links each account character card to the public character detail route", () => {
    const html = renderToStaticMarkup(
      createElement(AccountCharacterCard, {
        locale: "en",
        character: {
          id: 3,
          name: "mk",
          job: 5,
          classLabel: "Sura",
          level: 99,
          exp: 0,
          playtime: 22,
          lastPlay: "2026-04-19 00:27:14",
          guildName: null,
        },
      }),
    );

    expect(html).toContain('href="/characters/3"');
    expect(html).toContain("mk");
    expect(html).toContain("Sura");
    expect(html).toContain("22m");
  });
});
