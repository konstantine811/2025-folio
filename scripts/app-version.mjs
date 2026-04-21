import { spawnSync } from "node:child_process";
const VERSION_PREFIX = "1.0";
const BASE_PATCH = 4;
// Базовий commit-count для версії 1.0.4 (наступні коміти => 1.0.5, 1.0.6, ...).
const BASE_COMMIT_COUNT = 621;

export const FALLBACK_APP_VERSION = "1.0.4";

const runGit = (args) =>
  spawnSync("git", args, {
    encoding: "utf8",
    shell: process.platform === "win32",
  });

const ensureFullHistoryIfShallow = () => {
  const shallow = runGit(["rev-parse", "--is-shallow-repository"]);
  if (shallow.status !== 0) return;
  if (shallow.stdout.trim() !== "true") return;

  const unshallow = runGit(["fetch", "--quiet", "--unshallow"]);
  if (unshallow.status === 0) return;
  void runGit(["fetch", "--quiet", "--depth=50000"]);
};

const readGitCommitCount = () => {
  const result = runGit(["rev-list", "--count", "HEAD"]);
  if (result.status !== 0) return null;
  const count = Number.parseInt(result.stdout.trim(), 10);
  return Number.isFinite(count) ? count : null;
};

export const resolveAppVersion = () => {
  if (process.env.APP_VERSION_OVERRIDE) return process.env.APP_VERSION_OVERRIDE;

  ensureFullHistoryIfShallow();
  const commitCount = readGitCommitCount();
  if (commitCount === null) return FALLBACK_APP_VERSION;

  const patch = Math.max(
    BASE_PATCH,
    BASE_PATCH + commitCount - BASE_COMMIT_COUNT,
  );

  return `${VERSION_PREFIX}.${patch}`;
};
