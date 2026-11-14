import { runWorldCode } from "./runtime";
self.onmessage = (event: MessageEvent<unknown>) => {
  try {
    if (typeof event.data !== "string") throw new Error("Очікується текст коду");
    self.postMessage({ ok: true, ...runWorldCode(event.data) });
  } catch (error) {
    self.postMessage({ ok: false, error: error instanceof Error ? error.message : "Помилка виконання" });
  }
};
