function nodeBelongsToRoot(root: HTMLElement, node: Node | null): boolean {
  return !!node && (node === root || root.contains(node));
}

export function clearNodeWriterMarkdownSelection(root?: HTMLElement | null) {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const selection = window.getSelection();
  const shouldClearSelection =
    !root ||
    nodeBelongsToRoot(root, selection?.anchorNode ?? null) ||
    nodeBelongsToRoot(root, selection?.focusNode ?? null);

  if (selection && shouldClearSelection) {
    selection.removeAllRanges();
  }

  const activeEl = document.activeElement;
  if (
    activeEl instanceof HTMLElement &&
    (!root || activeEl === root || root.contains(activeEl))
  ) {
    activeEl.blur();
  }

  document.dispatchEvent(
    new KeyboardEvent("keydown", {
      key: "Escape",
      code: "Escape",
      bubbles: true,
      cancelable: true,
    }),
  );
}
