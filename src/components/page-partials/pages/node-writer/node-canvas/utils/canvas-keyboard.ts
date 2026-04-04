/** Фокус у полі вводу — гарячі клавіші полотна не перехоплюємо. */
export function isKeyboardTypingTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  return el.isContentEditable;
}

/**
 * Tab-панорама, /, K-ніж тощо: дозволено, коли фокус у скрол-зоні полотна,
 * або всередині ширшої оболонки перегляду (`extraContainmentRoot` — шапка + канвас),
 * або body/html.
 */
export function activeElementAllowsCanvasShortcuts(
  scrollRoot: HTMLElement | null,
  extraContainmentRoot?: HTMLElement | null,
): boolean {
  const ae = document.activeElement;
  if (!ae || !(ae instanceof HTMLElement)) return true;
  if (scrollRoot?.contains(ae)) return true;
  if (extraContainmentRoot?.contains(ae)) return true;
  return ae === document.body || ae === document.documentElement;
}

/** UK/UA ЙЦУКЕН: на місці латинської K друкується «л». */
const UKR_L_ON_K = "\u043B";
const UKR_L_ON_K_UPPER = "\u041B";

/**
 * Режим «ніж по звʼязках»: та сама клавіша, що латинська K (KeyK),
 * плюс символ з української розкладки на цій позиції — бо в деяких ОС/браузерах `code` буває ненадійним.
 */
export function isLinkKnifeArmKeyDown(e: KeyboardEvent): boolean {
  if (e.ctrlKey || e.metaKey || e.altKey) return false;
  if (e.isComposing) return false;
  if (e.code === "KeyK") return true;
  if (e.key === "k" || e.key === "K") return true;
  if (e.key === UKR_L_ON_K || e.key === UKR_L_ON_K_UPPER) return true;
  return false;
}

/** Відпускання тієї ж клавіші, що активувала ніж (див. `isLinkKnifeArmKeyDown`). */
export function isLinkKnifeArmKeyUp(e: KeyboardEvent): boolean {
  if (e.code === "KeyK") return true;
  if (e.key === "k" || e.key === "K") return true;
  if (e.key === UKR_L_ON_K || e.key === UKR_L_ON_K_UPPER) return true;
  return false;
}
