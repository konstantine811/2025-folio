import { unified } from "unified";
import remarkParse from "remark-parse";
import { visit } from "unist-util-visit";
import { Heading, Parent, Text, RootContent } from "mdast";
import { Children, isValidElement, ReactElement, ReactNode } from "react";
import slugify from "slugify";
import { IArticleHeading } from "@/types/blog-storage";

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
): string => {
  return text.replace(/!\[\[(.*?)\]\]/g, (_, filename) => {
    const url = getBlogImage(filename.trim());
    return `![](${url})`; // <-- ВАЖЛИВО! Це перетворює у Markdown зображення
  });
};
