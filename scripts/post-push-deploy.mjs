#!/usr/bin/env node
import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  buildChangedFilesCommand,
  getMainBranchRef,
  matchesExpectedRemote,
  parsePostPushRefs,
  sanitizeRemoteUrl,
  shouldInstallDependencies,
  shouldTriggerDeploy,
} from "./lib/post-push-deploy.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoDir = path.resolve(__dirname, "..");
const remoteName = process.argv[2] ?? "";
const remoteUrl = process.argv[3] ?? "";
const input = readFileSync(0, "utf8");
const refs = parsePostPushRefs(input);

if (!shouldTriggerDeploy({ remoteName, refs })) {
  console.log(`[post-push-deploy] skip: remote=${remoteName || "unknown"}`);
  process.exit(0);
}

const expectedRemoteUrl = execFileSync("git", ["remote", "get-url", "origin"], {
  cwd: repoDir,
  encoding: "utf8",
}).trim();

if (!matchesExpectedRemote({ remoteUrl, expectedRemoteUrl })) {
  console.log("[post-push-deploy] skip: remote url mismatch");
  process.exit(0);
}

const mainRef = getMainBranchRef(refs);

if (!mainRef) {
  console.log("[post-push-deploy] skip: no main branch update found");
  process.exit(0);
}

const changedFilesCommand = buildChangedFilesCommand(mainRef);

const changedFilesOutput = execFileSync("git", changedFilesCommand, {
  cwd: repoDir,
  encoding: "utf8",
});
const changedFiles = changedFilesOutput
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter(Boolean);
const deployArgs = [
  `--sha=${mainRef.localSha}`,
  `--previous-sha=${mainRef.remoteSha}`,
  `--remote=${remoteName}`,
  `--remote-url=${sanitizeRemoteUrl(remoteUrl)}`,
];

if (shouldInstallDependencies(changedFiles)) {
  deployArgs.push("--install-deps");
}

const result = spawnSync(path.join(repoDir, "scripts", "deploy-local.sh"), deployArgs, {
  cwd: repoDir,
  stdio: "inherit",
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
