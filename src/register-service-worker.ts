import { registerSW } from "virtual:pwa-register";

let hasReloadedForServiceWorkerUpdate = false;
let updateServiceWorker:
  | ((reloadPage?: boolean) => Promise<void>)
  | undefined;

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (hasReloadedForServiceWorkerUpdate) return;
    hasReloadedForServiceWorkerUpdate = true;
    window.location.reload();
  });
}

updateServiceWorker = registerSW({
  immediate: true,
  onNeedRefresh() {
    void updateServiceWorker?.(true);
  },
  onRegisteredSW(_swUrl, registration) {
    if (!registration) return;

    const checkForUpdates = () => {
      void registration.update().catch((error) => {
        console.warn("Service worker update check failed:", error);
      });
    };

    checkForUpdates();
    window.setInterval(checkForUpdates, 60 * 60 * 1000);
  },
  onRegisterError(error) {
    console.warn("Service worker registration failed:", error);
  },
});
