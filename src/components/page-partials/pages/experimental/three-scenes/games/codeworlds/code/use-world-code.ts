import { useCallback, useEffect, useRef, useState } from "react";
import { z } from "zod";
import { worldSchema } from "./world-model";

const resultSchema = z.discriminatedUnion("ok", [
  z.object({ ok: z.literal(true), world: worldSchema, logs: z.array(z.string().max(1000)).max(50) }),
  z.object({ ok: z.literal(false), error: z.string() }),
]);
export function useWorldCode(onSuccess: (world: z.infer<typeof worldSchema>) => void) {
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<string[]>(["Зміни приклад і створи власний світ."]);
  const [failed, setFailed] = useState(false);
  const active = useRef<{ worker: Worker; timer: ReturnType<typeof setTimeout> } | null>(null);
  const stop = useCallback(() => {
    if (active.current) { clearTimeout(active.current.timer); active.current.worker.terminate(); active.current = null; }
  }, []);
  useEffect(() => stop, [stop]);
  const run = useCallback((source: string) => {
    stop(); setBusy(true); setFailed(false); setMessages(["Будуємо світ…"]);
    const fail = (message: string) => { stop(); setBusy(false); setFailed(true); setMessages([message, "Попередній світ збережено."]); };
    try {
      const worker = new Worker(new URL("./runtime.worker.ts", import.meta.url), { type: "module" });
      const timer = setTimeout(() => fail("Час виконання вичерпано. Перевір цикли."), 2000);
      active.current = { worker, timer };
      worker.onmessage = event => {
        if (active.current?.worker !== worker) return;
        const result = resultSchema.safeParse(event.data);
        if (!result.success) { fail("Некоректний результат виконання"); return; }
        if (!result.data.ok) { fail(result.data.error); return; }
        stop(); setBusy(false);
        onSuccess(result.data.world);
        setMessages([...result.data.logs, `✓ Створено ${result.data.world.entities.length} об’єктів. Світ оновлено навколо тебе.`]);
      };
      worker.onerror = () => fail("Не вдалося запустити код");
      worker.postMessage(source);
    } catch (error) { fail(error instanceof Error ? error.message : "Не вдалося запустити код"); }
  }, [onSuccess, stop]);
  const cancel = () => { stop(); setBusy(false); setMessages(["Виконання зупинено. Світ не змінено."]); };
  return { run, busy, messages, failed, cancel };
}
