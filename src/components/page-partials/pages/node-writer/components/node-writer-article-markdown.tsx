import { Children, Fragment, isValidElement, type ReactNode } from "react";
import type { Components } from "react-markdown";
import { CodeBlock } from "@/components/ui-abc/code/code-block";
import { StyledKbd } from "@/components/ui-abc/styled-kbd";
import { createId } from "@/utils/markdown-pars.util";
import { MarkdownResolvingZoomableImg } from "../node-canvas/components/MarkdownResolvingZoomableImg";

/**
 * Стилі markdown як у `ParseMarkdown` (blog article), зображення — zoom без рамки.
 */
export function makeNodeWriterArticleMarkdownComponents(
  nodeId: string,
): Partial<Components> {
  const id = (children: ReactNode) =>
    `nw-${nodeId}-md-${createId(children)}`;

  return {
    img: ({ src, alt }) => (
      <MarkdownResolvingZoomableImg
        src={src}
        alt={alt}
        className="my-4 block w-full max-w-full max-h-[min(72vh,40rem)] object-contain"
      />
    ),
    h1: (props) => (
      <h1
        {...props}
        id={id(props.children)}
        className="scroll-mt-24 text-4xl font-bold text-primary md:text-5xl mb-6 mt-10"
      />
    ),
    h2: (props) => (
      <h2
        {...props}
        id={id(props.children)}
        className="scroll-mt-24 text-3xl font-semibold text-primary md:text-4xl mb-5 mt-8 border-b border-card pb-2"
      />
    ),
    h3: (props) => (
      <h3
        {...props}
        id={id(props.children)}
        className="scroll-mt-24 text-2xl font-semibold text-primary md:text-3xl mb-4 mt-6"
      />
    ),
    h4: (props) => (
      <h4
        {...props}
        id={id(props.children)}
        className="scroll-mt-24 text-xl font-medium text-primary md:text-2xl mb-3 mt-5"
      />
    ),
    h5: (props) => (
      <h5
        {...props}
        id={id(props.children)}
        className="scroll-mt-24 text-lg font-medium text-primary md:text-xl mb-2 mt-4"
      />
    ),
    h6: (props) => (
      <h6
        {...props}
        id={id(props.children)}
        className="scroll-mt-24 text-base font-medium text-primary uppercase tracking-wide md:text-lg mb-2 mt-3"
      />
    ),
    a: ({ href, children }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline-offset-2 transition-colors duration-150 hover:underline"
      >
        {children}
      </a>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-primary pl-4 italic text-highlight my-4">
        {children}
      </blockquote>
    ),
    span: (props) => <span {...props} />,
    p: ({ children }) => {
      const arrayChildren = Children.toArray(children);
      const isEmpty = arrayChildren.every((child) => {
        if (typeof child === "string") {
          return child.trim() === "";
        }
        if (isValidElement(child) && child.type === "br") {
          return true;
        }
        return false;
      });

      return isEmpty ? null : (
        <div className="text-base md:text-lg leading-7 mb-4 last:mb-0">
          {children}
        </div>
      );
    },
    table: (props) => (
      <div className="overflow-x-auto my-6">
        <table
          {...props}
          className="w-full border-2 border-card border-collapse text-sm md:text-base"
        />
      </div>
    ),
    thead: (props) => (
      <thead
        {...props}
        className="border border-foreground/50 text-left text-foreground"
      />
    ),
    th: (props) => (
      <th
        {...props}
        className="border border-foreground/50 px-4 py-2 font-semibold"
      />
    ),
    td: (props) => (
      <td {...props} className="border border-foreground/50 px-4 py-2" />
    ),
    ul: ({ children }) => (
      <ul className="list-disc list-outside ml-4 my-2 space-y-1 text-base md:text-lg leading-7">
        {children}
      </ul>
    ),
    ol: ({ node, ...props }) => {
      const start = (node?.properties?.start as number) || 1;
      return (
        <ol
          start={start}
          {...props}
          className="list-decimal list-outside ml-6 my-2 space-y-1 text-base md:text-lg leading-7"
        />
      );
    },
    li: ({ children }) => <li className="ml-2">{children}</li>,
    code: CodeBlock,
    pre: ({ children }) => <Fragment>{children}</Fragment>,
    kbd: ({ children }) => <StyledKbd>{children}</StyledKbd>,
    hr: () => (
      <hr className="my-6 border-0 border-t border-foreground/20" />
    ),
  };
}
