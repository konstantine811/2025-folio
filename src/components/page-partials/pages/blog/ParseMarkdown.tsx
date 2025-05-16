import { CodeBlock } from "@/components/ui-abc/code/code-block";
import ImageWithLoader from "@/components/ui-abc/image-with-loader";
import SoundHoverElement from "@/components/ui-abc/sound-hover-element";
import { StyledKbd } from "@/components/ui-abc/styled-kbd";
import { DEFAULT_LOCALE_PLUG } from "@/config/router-config";
import { getBlogImage } from "@/config/supabaseClient";
import useTransitionRouteTo from "@/hooks/useRouteTransitionTo";
import { HoverStyleElement, SoundTypeElement } from "@/types/sound";
import { createId, formatMarkdown } from "@/utils/markdown-pars.util";

import { Children, isValidElement, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

const ParseMarkdown = ({
  content,
  onFormatted,
}: {
  content: string;
  onFormatted: (status: boolean) => void;
}) => {
  const navigateTo = useTransitionRouteTo();
  const [formattedContent, setFormattedContent] = useState<string>(content);
  useEffect(() => {
    onFormatted(false);
    formatMarkdown(content, getBlogImage).then((formattedContent) => {
      setFormattedContent(formattedContent);
      setTimeout(() => {
        onFormatted(true);
      }, 1000);
    });
  }, [content, onFormatted]);
  return (
    <ReactMarkdown
      rehypePlugins={[rehypeRaw]}
      remarkPlugins={[remarkGfm]}
      components={{
        img: ({ src, alt }) => <ImageWithLoader src={src} alt={alt} />,
        h1: (props) => (
          <h1
            {...props}
            id={createId(props.children)}
            className="text-4xl md:text-5xl font-bold mb-6 mt-10 text-accent"
          />
        ),
        h2: (props) => {
          return (
            <h2
              {...props}
              id={createId(props.children)}
              className="text-3xl md:text-4xl font-semibold mb-5 mt-8 border-b border-background-alt pb-2"
            />
          );
        },
        h3: (props) => {
          return (
            <h3
              {...props}
              id={createId(props.children)}
              className="text-2xl md:text-3xl font-semibold mb-4 mt-6"
            />
          );
        },
        h4: (props) => (
          <h4
            {...props}
            id={createId(props.children)}
            className="text-xl md:text-2xl font-medium mb-3 mt-5"
          />
        ),
        h5: (props) => (
          <h5
            {...props}
            id={createId(props.children)}
            className="text-lg md:text-xl font-medium mb-2 mt-4"
          />
        ),
        h6: (props) => (
          <h6
            {...props}
            id={createId(props.children)}
            className="text-base md:text-lg font-medium mb-2 mt-3 text-fg-muted uppercase tracking-wide"
          />
        ),
        a: ({ href, children }) => {
          if (href?.startsWith(DEFAULT_LOCALE_PLUG)) {
            const path = href.replace(`${DEFAULT_LOCALE_PLUG}`, "");
            return (
              <SoundHoverElement
                as="a"
                hoverTypeElement={SoundTypeElement.LINK}
                hoverStyleElement={HoverStyleElement.none}
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo(path);
                  return;
                }}
                className="text-accent hover:underline underline-offset-2 transition-colors duration-150 cursor-pointer"
              >
                {children}
              </SoundHoverElement>
            );
          }

          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline underline-offset-2 transition-colors duration-150"
            >
              {children}
            </a>
          );
        },
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-accent pl-4 italic text-highlight my-4">
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
              className="w-full border border-background-alt border-collapse text-sm md:text-base"
            />
          </div>
        ),
        thead: (props) => (
          <thead
            {...props}
            className="border-background-alt text-left text-fg"
          />
        ),
        th: (props) => (
          <th
            {...props}
            className="border border-background-alt px-4 py-2 font-semibold whitespace-nowrap"
          />
        ),
        td: (props) => (
          <td
            {...props}
            className="border border-background-alt px-4 py-2 whitespace-nowrap"
          />
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
        kbd: ({ children }) => <StyledKbd>{children}</StyledKbd>,
      }}
    >
      {formattedContent}
    </ReactMarkdown>
  );
};

export default ParseMarkdown;
