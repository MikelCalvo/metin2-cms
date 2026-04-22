import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getCurrentAuthenticatedAccountMock,
  getRecoveryDeliveryConfigMock,
  useActionStateMock,
} = vi.hoisted(() => ({
  getCurrentAuthenticatedAccountMock: vi.fn(),
  getRecoveryDeliveryConfigMock: vi.fn(),
  useActionStateMock: vi.fn(),
}));

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");

  return {
    ...actual,
    useActionState: useActionStateMock,
  };
});

vi.mock("@/server/auth/current-account", () => ({
  getCurrentAuthenticatedAccount: getCurrentAuthenticatedAccountMock,
}));

vi.mock("@/server/recovery/recovery-delivery", () => ({
  getRecoveryDeliveryConfig: getRecoveryDeliveryConfigMock,
}));

vi.mock("@/app/auth/actions", () => ({
  registerAction: vi.fn(),
  requestRecoveryAction: vi.fn(),
}));

import RecoverPage from "@/app/recover/page";
import RegisterPage from "@/app/register/page";

describe("public auth pages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useActionStateMock.mockReturnValue([{ status: "idle" }, vi.fn()]);
    getCurrentAuthenticatedAccountMock.mockResolvedValue(null);
    getRecoveryDeliveryConfigMock.mockReturnValue({ mode: "file" });
  });

  it("renders register as a single centered player-facing form", async () => {
    const html = renderToStaticMarkup(await RegisterPage());

    expect(html).toContain("Create account");
    expect(html).toContain('href="/login"');
    expect(html).not.toContain("A cleaner onboarding layer for the same server account");
    expect(html).not.toContain("real account schema");
    expect(html).not.toContain("future item shop features");
    expect(html).not.toContain("Live schema fields");
    expect(html).not.toContain("Safer web layer");
    expect(html).not.toContain("Future-ready profile");
    expect(html).not.toContain("Metin2 CMS");
  });

  it("renders recover as a single centered player-facing form", async () => {
    const html = renderToStaticMarkup(await RecoverPage());

    expect(html).toContain("Recover password");
    expect(html).toContain('href="/login"');
    expect(html).not.toContain("Recover access without falling back to the old CMS");
    expect(html).not.toContain("Temporary operator-assisted delivery");
    expect(html).not.toContain("Recovery design");
    expect(html).not.toContain("Operator queue");
    expect(html).not.toContain("Password rotation");
    expect(html).not.toContain("Metin2 CMS");
  });
});
