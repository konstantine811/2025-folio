import { unified } from "unified";
import remarkParse from "remark-parse";
import { visit } from "unist-util-visit";
import { Heading, Parent, Text, RootContent } from "mdast";
import { Children, isValidElement, ReactElement, ReactNode } from "react";
import slugify from "slugify";
import { IArticleHeading } from "@/types/blog-storage";
import {
  DEFAULT_LOCALE_PLUG,
  DEFAULT_OBSIDIAN_VAULT,
  RoutPath,
} from "@/config/router-config";
import { getBlogArticleId } from "@/services/firebase/fetchBlogData";

export const extractText = (node: RootContent): string => {
  if (node.type === "text") return (node as Text).value;
  if ("children" in node && Array.isArray((node as Parent).children)) {
    return (node as Parent).children.map(extractText).join("");
  }
  return "";
};

export const extractHeadingsFromMarkdown = (markdown: string) => {
  const tree = unified().use(remarkParse).parse(markdown);

  const headings: IArticleHeading[] = [];

  visit(tree, "heading", (node: Heading) => {
    const text = extractText(node);
    headings.push({ depth: node.depth, text, id: createId(text) });
  });

  return headings;
};

export const extractTextFromReactChildren = (children: ReactNode): string => {
  const array = Children.toArray(children);

  return array
    .map((child) => {
      if (typeof child === "string" || typeof child === "number")
        return String(child);
      if (isValidElement(child)) {
        const element = child as ReactElement<{ children?: ReactNode }>;
        return extractTextFromReactChildren(element.props.children);
      }
      return "";
    })
    .join("");
};

export const createId = (children: ReactNode): string => {
  return slugify(extractTextFromReactChildren(children), {
    lower: true,
    strict: true,
  });
};

export const formatMarkdown = (
  text: string,
  getBlogImage: (filename: string) => string
): Promise<string> => {
  // 1. Обробка Obsidian-зображень
  const output = text.replace(/!\[\[(.*?)\]\]/g, (_, filename) => {
    const url = getBlogImage(filename.trim());
    return `![](${url})`;
  });

  // 2. Замінюємо Obsidian-лінки типу obsidian://open?vault=...&file=... на кастомні лінки

  return replaceObsidianLinksWithCustomId(output);
};

export async function replaceObsidianLinksWithCustomId(
  markdown: string
): Promise<string> {
  const regex = /\[([^\]]+)\]\(obsidian:\/\/open\?vault=[^&]+&file=([^)]+)\)/g;
  const matches = [...markdown.matchAll(regex)];
  let updated = markdown;

  for (const match of matches) {
    const [fullMatch, label, encodedPath] = match;
    const decodedPath = decodeURIComponent(encodedPath);
    let replacement = `[${label}](https:/${decodedPath})`; // default

    if (decodedPath.startsWith(DEFAULT_OBSIDIAN_VAULT.blogVault)) {
      const langPath = extractLangPathFromUrl(decodedPath)?.split("/");
      if (langPath?.length === 4) {
        const id = await getBlogArticleId(
          langPath[0],
          langPath[1],
          langPath[2],
          langPath[3]
        );
        if (id) {
          replacement = `[${label}](${DEFAULT_LOCALE_PLUG}${RoutPath.BLOG}/${id})`;
        }
      }
    }

    updated = updated.replace(fullMatch, replacement);
  }

  return updated;
}

export function extractLangPathFromUrl(url: string): string | null {
  const match = url.match(/(?:\/)(ua|en)\/.+/); // включає і передній слеш
  return match ? match[0].slice(1) : null; // видаляємо початковий /
}
