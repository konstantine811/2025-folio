import { spawnSync } from "node:child_process";

const VERSION_PREFIX = "1.0";
// Keep the visible version at 1.0.3 for the current history, then increment
// the patch number by one for each new commit that gets built/deployed.
const CURRENT_PATCH = 3;
const CURRENT_COMMIT_COUNT = 619;

const run = (command, args, options = {}) => {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
    ...options,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

const readGitCommitCount = () => {
  const result = spawnSync("git", ["rev-list", "--count", "HEAD"], {
    encoding: "utf8",
    shell: process.platform === "win32",
  });

  if (result.status !== 0) return null;

  const count = Number.parseInt(result.stdout.trim(), 10);
  return Number.isFinite(count) ? count : null;
};

const resolveAppVersion = () => {
  if (process.env.VITE_APP_VERSION) return process.env.VITE_APP_VERSION;

  const commitCount = readGitCommitCount();
  if (commitCount === null) return `${VERSION_PREFIX}.${CURRENT_PATCH}`;

  const patch = Math.max(
    CURRENT_PATCH,
    CURRENT_PATCH + commitCount - CURRENT_COMMIT_COUNT,
  );

  return `${VERSION_PREFIX}.${patch}`;
};

const appVersion = resolveAppVersion();

console.info(`Building app version ${appVersion}`);

run("tsc", ["-b"]);
run("vite", ["build"], {
  env: {
    ...process.env,
    VITE_APP_VERSION: appVersion,
  },
});
