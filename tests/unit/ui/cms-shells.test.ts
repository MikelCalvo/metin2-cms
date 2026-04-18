import { renderToStaticMarkup } from "react-dom/server";
import { createElement, type ComponentProps } from "react";
import { describe, expect, it } from "vitest";

import { AuthPageShell } from "@/components/cms/auth-page-shell";
import { CmsPageHeader, CmsPageShell } from "@/components/cms/page-shell";

describe("cms shells", () => {
  it("renders the shared page shell and header content", () => {
    const html = renderToStaticMarkup(
      createElement(
        CmsPageShell,
        null,
        createElement(CmsPageHeader, {
          eyebrow: "Overview",
          title: "Modern Metin2 control center",
          description: "A unified surface for auth, account security and operations.",
          actions: createElement("a", { href: "/login" }, "Sign in"),
        }),
        createElement("section", null, "Shell content"),
      ),
    );

    expect(html).toContain("Overview");
    expect(html).toContain("Modern Metin2 control center");
    expect(html).toContain("A unified surface for auth, account security and operations.");
    expect(html).toContain("Sign in");
    expect(html).toContain("Shell content");
  });

  it("renders the auth split shell with support copy and footer", () => {
    const authPageShellProps: Omit<ComponentProps<typeof AuthPageShell>, "children"> = {
      eyebrow: "Secure access",
      title: "Sign in",
      description: "Access the CMS with legacy-compatible credentials.",
      supportEyebrow: "Why this matters",
      supportTitle: "Everything sensitive in one place",
      supportDescription: "The modern CMS keeps web session controls separate from the game stack.",
      supportItems: [
        {
          title: "Session controls",
          description: "Review and revoke active web sessions from the account center.",
        },
        {
          title: "Recovery flow",
          description: "Reset passwords without reintroducing the old PHP stack.",
        },
      ],
      footer: createElement("div", null, "Need help? Contact an operator."),
    };

    const html = renderToStaticMarkup(
      createElement(
        AuthPageShell,
        authPageShellProps as ComponentProps<typeof AuthPageShell>,
        createElement(
          "form",
          null,
          createElement("button", { type: "submit" }, "Submit"),
        ),
      ),
    );
    expect(html).toContain("Secure access");
    expect(html).toContain("Everything sensitive in one place");
    expect(html).toContain("Session controls");
    expect(html).toContain("Recovery flow");
    expect(html).toContain("Need help? Contact an operator.");
    expect(html).toContain("Submit");
  });
});
