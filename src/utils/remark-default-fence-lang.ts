import type { Code, Root } from "mdast";
import { visit } from "unist-util-visit";

const DEFAULT = "js";

/**
 * Якщо fenced-блок без мови (``` без тега), mdast не ставить `lang` і немає `language-*` —
 * react-markdown тоді не дає блоковий підсвічений `code`. Підставляємо дефолт для вузлів `code` (не `inlineCode`).
 */
export const remarkDefaultFenceLang = () => (tree: Root) => {
  visit(tree, "code", (node: Code) => {
    if (!node.lang?.trim()) {
      node.lang = DEFAULT;
    }
  });
};
