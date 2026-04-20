import { spawnSync } from "node:child_process";

const VERSION_PREFIX = "1.0";
const BASE_PATCH = 3;
// Commit a2bf0a3 made Vite inject the version everywhere while the public
// version was still stuck at 1.0.3. Treat it as the 1.0.4 baseline.
const BASE_COMMIT_COUNT = 621;

export const FALLBACK_APP_VERSION = "1.0.4";

const readGitCommitCount = () => {
  const result = spawnSync("git", ["rev-list", "--count", "HEAD"], {
    encoding: "utf8",
    shell: process.platform === "win32",
  });

  if (result.status !== 0) return null;

  const count = Number.parseInt(result.stdout.trim(), 10);
  return Number.isFinite(count) ? count : null;
};

export const resolveAppVersion = () => {
  if (process.env.VITE_APP_VERSION) return process.env.VITE_APP_VERSION;

  const commitCount = readGitCommitCount();
  if (commitCount === null) return FALLBACK_APP_VERSION;

  const patch = Math.max(
    BASE_PATCH,
    BASE_PATCH + commitCount - BASE_COMMIT_COUNT,
  );

  return `${VERSION_PREFIX}.${patch}`;
};
