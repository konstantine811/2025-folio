import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export const FALLBACK_APP_VERSION = "1.0.4";

const readPackageVersion = () => {
  try {
    const packageJsonPath = resolve(process.cwd(), "package.json");
    const raw = readFileSync(packageJsonPath, "utf8");
    const parsed = JSON.parse(raw);
    const version =
      typeof parsed?.version === "string" ? parsed.version.trim() : "";
    if (!version || version === "0.0.0") return null;
    return version;
  } catch {
    return null;
  }
};

const readGitShortSha = () => {
  const result = spawnSync("git", ["rev-parse", "--short=7", "HEAD"], {
    encoding: "utf8",
    shell: process.platform === "win32",
  });

  if (result.status !== 0) return null;

  const sha = result.stdout.trim();
  return sha || null;
};

const readCiCommitSha = () => {
  const raw =
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.GITHUB_SHA ||
    process.env.CI_COMMIT_SHA ||
    "";
  const sha = raw.trim();
  if (!sha) return null;
  return sha.slice(0, 7);
};

export const resolveAppVersion = () => {
  if (process.env.APP_VERSION_OVERRIDE) return process.env.APP_VERSION_OVERRIDE;

  const baseVersion =
    process.env.APP_VERSION_BASE || readPackageVersion() || FALLBACK_APP_VERSION;
  const sha = readCiCommitSha() || readGitShortSha();

  if (!sha) return baseVersion;
  return `${baseVersion}+${sha}`;
};
