import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { DownloadChecksumCopyButton } from "@/components/downloads/checksum-copy-button";

describe("download checksum copy button", () => {
  it("renders the inline checksum value with a copy action", () => {
    const html = renderToStaticMarkup(
      createElement(DownloadChecksumCopyButton, { checksum: "abc123def456" }),
    );

    expect(html).toContain('data-slot="downloads-inline-checksum"');
    expect(html).toContain("SHA256");
    expect(html).toContain("abc123def456");
    expect(html).toContain('aria-label="Copy SHA256 checksum"');
    expect(html).toContain("Copy");
    expect(html).not.toContain("Copied");
  });
});
