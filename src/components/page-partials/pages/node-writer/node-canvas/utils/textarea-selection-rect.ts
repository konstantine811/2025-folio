/** Viewport rect of selected text inside a <textarea> (mirror div, same font/padding/scroll). */

export function getTextareaRangeClientRect(
  textarea: HTMLTextAreaElement,
  start: number,
  end: number,
): DOMRect | null {
  if (typeof document === "undefined" || !document.body) return null;

  let a = start;
  let b = end;
  if (a > b) [a, b] = [b, a];
  const value = textarea.value;
  if (a < 0 || b > value.length || a === b) return null;

  const taRect = textarea.getBoundingClientRect();
  const style = getComputedStyle(textarea);

  const div = document.createElement("div");
  div.setAttribute("aria-hidden", "true");
  Object.assign(div.style, {
    position: "fixed",
    left: `${taRect.left}px`,
    top: `${taRect.top}px`,
    width: `${textarea.clientWidth}px`,
    height: `${textarea.clientHeight}px`,
    visibility: "hidden",
    overflow: "hidden",
    whiteSpace: "pre-wrap",
    wordWrap: "break-word",
    boxSizing: style.boxSizing,
    padding: style.padding,
    border: style.border,
    font: style.font,
    lineHeight: style.lineHeight,
    letterSpacing: style.letterSpacing,
    textAlign: style.textAlign,
    tabSize: style.tabSize,
  });

  div.appendChild(document.createTextNode(value.slice(0, a)));
  const span = document.createElement("span");
  span.appendChild(document.createTextNode(value.slice(a, b)));
  div.appendChild(span);
  div.appendChild(document.createTextNode(value.slice(b)));

  div.scrollTop = textarea.scrollTop;
  div.scrollLeft = textarea.scrollLeft;

  document.body.appendChild(div);
  const spanRect = span.getBoundingClientRect();
  document.body.removeChild(div);

  return spanRect;
}
