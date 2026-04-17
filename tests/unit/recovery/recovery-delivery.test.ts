import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { mkdirMock, writeFileMock } = vi.hoisted(() => ({
  mkdirMock: vi.fn(),
  writeFileMock: vi.fn(),
}));

vi.mock("node:fs/promises", () => ({
  mkdir: mkdirMock,
  writeFile: writeFileMock,
}));

import {
  deliverPasswordRecoveryLink,
  getRecoveryDeliveryConfig,
} from "@/server/recovery/recovery-delivery";

describe("recovery delivery", () => {
  beforeEach(() => {
    vi.stubEnv("APP_BASE_URL", "http://localhost:3000");
    vi.stubEnv("NODE_ENV", "test");
    mkdirMock.mockReset();
    writeFileMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("defaults to preview mode outside production", () => {
    expect(getRecoveryDeliveryConfig()).toMatchObject({
      mode: "preview",
    });
  });

  it("defaults to file mode in production", () => {
    vi.stubEnv("NODE_ENV", "production");

    expect(getRecoveryDeliveryConfig()).toMatchObject({
      mode: "file",
    });
  });

  it("rejects preview mode in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("RECOVERY_DELIVERY_MODE", "preview");

    expect(() => getRecoveryDeliveryConfig()).toThrow(
      /RECOVERY_DELIVERY_MODE=preview is not allowed in production/,
    );
  });

  it("writes recovery messages to a file outbox in file mode", async () => {
    vi.stubEnv("RECOVERY_DELIVERY_MODE", "file");
    vi.stubEnv("RECOVERY_FILE_OUTBOX_DIR", "/tmp/metin2-cms-recovery-outbox");

    const result = await deliverPasswordRecoveryLink({
      login: "tester01",
      email: "tester@example.com",
      resetUrl:
        "http://localhost:3000/reset-password?token=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      requestedAt: "2026-04-17 16:00:00",
      requestedIp: "127.0.0.1",
      requestedUserAgent: "Vitest",
    });

    expect(result.previewResetUrl).toBeUndefined();
    expect(mkdirMock).toHaveBeenCalledWith("/tmp/metin2-cms-recovery-outbox", {
      recursive: true,
    });
    expect(writeFileMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/tmp\/metin2-cms-recovery-outbox\/.*\.json$/),
      expect.stringContaining('"resetUrl": "http://localhost:3000/reset-password?token=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"'),
      { flag: "wx" },
    );
  });
});
