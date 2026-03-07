import { init } from "recast-navigation";

let ready = false;

export async function ensureRecast() {
  if (!ready) {
    await init();
    ready = true;
  }
}
