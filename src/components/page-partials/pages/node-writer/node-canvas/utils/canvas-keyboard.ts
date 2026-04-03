/** Фокус у полі вводу — гарячі клавіші полотна не перехоплюємо. */
export function isKeyboardTypingTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  return el.isContentEditable;
}

/** Tab-панорама та / працюють, коли фокус у скрол-зоні канвасу або на body/html. */
export function activeElementAllowsCanvasShortcuts(
  scrollRoot: HTMLElement | null,
): boolean {
  const ae = document.activeElement;
  if (!ae || !(ae instanceof HTMLElement)) return true;
  if (scrollRoot?.contains(ae)) return true;
  return ae === document.body || ae === document.documentElement;
}
