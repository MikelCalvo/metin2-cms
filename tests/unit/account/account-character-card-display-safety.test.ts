import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { AccountCharacterCard } from "@/components/account/account-character-card";

describe("account character card display safety", () => {
  it("sanitizes character and guild labels at render time", () => {
    const html = renderToStaticMarkup(
      AccountCharacterCard({
        locale: "en",
        character: {
          id: 9,
          name: "<script>alert(1)</script>",
          job: 0,
          classLabel: "Warrior",
          level: 75,
          exp: 12345,
          playtime: 77,
          lastPlay: "2026-04-17 05:45:44",
          guildName: "\u202E<Guild>\nOne",
        },
      }),
    );

    expect(html).toContain("‹script›alert(1)‹/script›");
    expect(html).toContain("‹Guild› One");
    expect(html).not.toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
  });
});
