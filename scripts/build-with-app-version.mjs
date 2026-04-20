import { spawnSync } from "node:child_process";
import { resolveAppVersion } from "./app-version.mjs";

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

const appVersion = resolveAppVersion();

console.info(`Building app version ${appVersion}`);

run("tsc", ["-b"]);
run("vite", ["build"], {
  env: {
    ...process.env,
    VITE_APP_VERSION: appVersion,
  },
});
