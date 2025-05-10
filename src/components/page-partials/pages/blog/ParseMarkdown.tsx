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
        img: (props) => (
          <img
            {...props}
            className="rounded-lg pt-2 pb-5 md:pb-10 lg:pb-20 mb-4 last:mb-0 mx-auto"
            alt=""
            loading="lazy"
          />
        ),
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
          return isEmpty ? null : <p className="mb-4 last:mb-0">{children}</p>;
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
      }}
    >
      {formatMarkdown(content, getBlogImage)}
    </ReactMarkdown>
  );
};

export default ParseMarkdown;
