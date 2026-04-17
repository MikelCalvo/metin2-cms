import { mkdir, rm, symlink } from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

async function main() {
  if (process.platform !== "freebsd") {
    console.log("[postinstall] FreeBSD SWC workaround not needed on this platform.");
    return;
  }

  const nextPackagePath = require.resolve("next/package.json");
  const swcWasmPackagePath = require.resolve("@next/swc-wasm-nodejs/package.json");

  const nextPackageDir = path.dirname(nextPackagePath);
  const swcWasmPackageDir = path.dirname(swcWasmPackagePath);
  const linkTarget = path.join(nextPackageDir, "wasm", "@next", "swc-wasm-nodejs");

  await mkdir(path.dirname(linkTarget), { recursive: true });
  await rm(linkTarget, { force: true, recursive: true });
  await symlink(swcWasmPackageDir, linkTarget, "dir");

  console.log(`[postinstall] Linked FreeBSD SWC WASM fallback: ${linkTarget}`);
}

main().catch((error) => {
  console.error("[postinstall] Failed to prepare FreeBSD SWC WASM fallback.");
  console.error(error);
  process.exitCode = 1;
});
