import { init } from "recast-navigation";

let ready = false;
export async function ensureRecast() {
  if (!ready) {
    await init(); // підтягує wasm і реєструє класи (NavMesh, Detour, ...)
    ready = true;
  }
}
