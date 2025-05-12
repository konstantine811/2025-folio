import ImageWithLoader from "@/components/ui-abc/image-with-loader";
import { getBlogImage } from "@/config/supabaseClient";
import { createId, formatMarkdown } from "@/utils/markdown-pars.util";
import { Children, isValidElement } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

const ParseMarkdown = ({ content }: { content: string }) => {
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
              className="text-3xl md:text-4xl font-semibold mb-5 mt-8 border-b border-gray-600 pb-2"
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
            className="text-base md:text-lg font-medium mb-2 mt-3 text-gray-400 uppercase tracking-wide"
          />
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline underline-offset-2 transition-colors duration-150"
          >
            {children}
          </a>
        ),
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
              className="w-full border border-gray-700 border-collapse text-sm md:text-base"
            />
          </div>
        ),
        thead: (props) => (
          <thead {...props} className="bg-gray-800 text-left text-gray-100" />
        ),
        th: (props) => (
          <th
            {...props}
            className="border border-gray-700 px-4 py-2 font-semibold whitespace-nowrap"
          />
        ),
        td: (props) => (
          <td
            {...props}
            className="border border-gray-700 px-4 py-2 whitespace-nowrap"
          />
        ),
        ul: ({ children }) => (
          <ul className="list-disc list-inside ml-4 my-2 space-y-1 text-base md:text-lg leading-7">
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
        code: ({ className, children }) => {
          const isBlock = className?.includes("language-");
          if (isBlock) {
            return (
              <pre className="my-4 p-4 rounded-lg bg-background-alt text-accent overflow-x-auto text-sm">
                <code className={className}>{children}</code>
              </pre>
            );
          }

          return (
            <code className="bg-background-alt text-accent px-3 py-2 rounded text-sm">
              {children}
            </code>
          );
        },
      }}
    >
      {formatMarkdown(content, getBlogImage)}
    </ReactMarkdown>
  );
};

export default ParseMarkdown;
