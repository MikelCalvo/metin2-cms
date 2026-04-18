import { describe, expect, it } from "vitest";

import {
  buildChangedFilesCommand,
  matchesExpectedRemote,
  parsePostPushRefs,
  sanitizeRemoteUrl,
  shouldInstallDependencies,
  shouldTriggerDeploy,
} from "../../../scripts/lib/post-push-deploy.mjs";

describe("post-push deploy helpers", () => {
  it("parses post-push stdin into ref update records", () => {
    expect(
      parsePostPushRefs(
        [
          "refs/heads/main aaaaa11111111111111111111111111111111111 refs/heads/main bbbbb22222222222222222222222222222222222",
          "refs/tags/v1 ccccc33333333333333333333333333333333333 refs/tags/v1 ddddd44444444444444444444444444444444444",
        ].join("\n"),
      ),
    ).toEqual([
      {
        localRef: "refs/heads/main",
        localSha: "aaaaa11111111111111111111111111111111111",
        remoteRef: "refs/heads/main",
        remoteSha: "bbbbb22222222222222222222222222222222222",
      },
      {
        localRef: "refs/tags/v1",
        localSha: "ccccc33333333333333333333333333333333333",
        remoteRef: "refs/tags/v1",
        remoteSha: "ddddd44444444444444444444444444444444444",
      },
    ]);
  });

  it("triggers deploy only for origin main updates that are not deletes", () => {
    expect(
      shouldTriggerDeploy({
        remoteName: "origin",
        refs: [
          {
            localRef: "refs/heads/main",
            localSha: "aaaaa11111111111111111111111111111111111",
            remoteRef: "refs/heads/main",
            remoteSha: "bbbbb22222222222222222222222222222222222",
          },
        ],
      }),
    ).toBe(true);

    expect(
      shouldTriggerDeploy({
        remoteName: "origin",
        refs: [
          {
            localRef: "(delete)",
            localSha: "0000000000000000000000000000000000000000",
            remoteRef: "refs/heads/main",
            remoteSha: "bbbbb22222222222222222222222222222222222",
          },
        ],
      }),
    ).toBe(false);

    expect(
      shouldTriggerDeploy({
        remoteName: "backup",
        refs: [
          {
            localRef: "refs/heads/main",
            localSha: "aaaaa11111111111111111111111111111111111",
            remoteRef: "refs/heads/main",
            remoteSha: "bbbbb22222222222222222222222222222222222",
          },
        ],
      }),
    ).toBe(false);
    expect(
      shouldTriggerDeploy({
        remoteName: "origin",
        refs: [
          {
            localRef: "refs/heads/feature-x",
            localSha: "aaaaa11111111111111111111111111111111111",
            remoteRef: "refs/heads/feature-x",
            remoteSha: "bbbbb22222222222222222222222222222222222",
          },
        ],
      }),
    ).toBe(false);
  });

  it("uses the full tree listing for first deploys and normalizes remote urls", () => {
    expect(
      buildChangedFilesCommand({
        localRef: "refs/heads/main",
        localSha: "aaaaa11111111111111111111111111111111111",
        remoteRef: "refs/heads/main",
        remoteSha: "0000000000000000000000000000000000000000",
      }),
    ).toEqual(["ls-tree", "-r", "--name-only", "aaaaa11111111111111111111111111111111111"]);

    expect(
      buildChangedFilesCommand({
        localRef: "refs/heads/main",
        localSha: "aaaaa11111111111111111111111111111111111",
        remoteRef: "refs/heads/main",
        remoteSha: "bbbbb22222222222222222222222222222222222",
      }),
    ).toEqual([
      "diff",
      "--name-only",
      "bbbbb22222222222222222222222222222222222",
      "aaaaa11111111111111111111111111111111111",
    ]);

    expect(
      matchesExpectedRemote({
        remoteUrl: "https://deploy-user:top-secret-token@example.com/acme/site.git/",
        expectedRemoteUrl: "https://example.com/acme/site.git",
      }),
    ).toBe(true);
    expect(
      matchesExpectedRemote({
        remoteUrl: "git@example.com:acme/site.git",
        expectedRemoteUrl: "git@example.com:other/site.git",
      }),
    ).toBe(false);
    expect(
      sanitizeRemoteUrl("https://deploy-user:top-secret-token@example.com/acme/site.git/"),
    ).toBe("https://example.com/acme/site.git");
  });

  it("requests dependency installation only when dependency manifests changed", () => {
    expect(
      shouldInstallDependencies([
        "src/app/page.tsx",
        "pnpm-lock.yaml",
      ]),
    ).toBe(true);
    expect(
      shouldInstallDependencies([
        "package.json",
      ]),
    ).toBe(true);
    expect(
      shouldInstallDependencies([
        "README.md",
        "src/app/login/page.tsx",
      ]),
    ).toBe(false);
  });
});
