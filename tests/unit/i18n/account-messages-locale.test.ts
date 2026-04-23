import { describe, expect, it } from "vitest";

import { getMessages } from "@/lib/i18n/messages";

describe("account messages locale", () => {
  it("keeps the updated account hub copy in spanish", () => {
    const messages = getMessages("es");

    expect(messages.account.playerHubTitle).toBe("Información del personaje");
    expect(messages.account.featuredCharacterTitle).toBe("Información del personaje");
    expect(messages.account.readyTitle).toBe("Información de sesión");
    expect(messages.account.previousLoginIpTitle).toBe("Última IP");
  });
});
