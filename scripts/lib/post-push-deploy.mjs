export const ZERO_SHA = "0000000000000000000000000000000000000000";

export function parsePostPushRefs(input) {
  return input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [localRef, localSha, remoteRef, remoteSha] = line.split(/\s+/);

      if (!localRef || !localSha || !remoteRef || !remoteSha) {
        throw new Error(`Invalid post-push line: ${line}`);
      }

      return {
        localRef,
        localSha,
        remoteRef,
        remoteSha,
      };
    });
}

export function sanitizeRemoteUrl(remoteUrl) {
  return remoteUrl.replace(/:\/\/[^@/]+@/, "://").replace(/\/$/, "");
}

export function matchesExpectedRemote({ remoteUrl, expectedRemoteUrl }) {
  return sanitizeRemoteUrl(remoteUrl) === sanitizeRemoteUrl(expectedRemoteUrl);
}

export function shouldTriggerDeploy({ remoteName, refs }) {
  if (remoteName !== "origin") {
    return false;
  }

  return refs.some(
    (ref) =>
      ref.remoteRef === "refs/heads/main" &&
      ref.localRef !== "(delete)" &&
      ref.localSha !== ZERO_SHA,
  );
}

export function shouldInstallDependencies(changedFiles) {
  const dependencyManifests = new Set([
    "package.json",
    "pnpm-lock.yaml",
    "pnpm-workspace.yaml",
  ]);

  return changedFiles.some((file) => dependencyManifests.has(file));
}

export function getMainBranchRef(refs) {
  return (
    refs.find(
      (ref) =>
        ref.remoteRef === "refs/heads/main" &&
        ref.localRef !== "(delete)" &&
        ref.localSha !== ZERO_SHA,
    ) ?? null
  );
}

export function buildChangedFilesCommand(ref) {
  if (ref.remoteSha === ZERO_SHA) {
    return ["ls-tree", "-r", "--name-only", ref.localSha];
  }

  return ["diff", "--name-only", ref.remoteSha, ref.localSha];
}
