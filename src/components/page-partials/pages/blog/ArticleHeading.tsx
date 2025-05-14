import { useActiveHeading } from "@/hooks/blog-handle/useActiveHeading";
import { useHeaderSizeStore } from "@/storage/headerSizeStore";
import { IArticleHeading } from "@/types/blog-storage";

const ArticleHeading = ({
  headings,
  title,
}: {
  title: string;
  headings: IArticleHeading[];
}) => {
  const hSize = useHeaderSizeStore((state) => state.size);
  const activeId = useActiveHeading(
    headings.map((h) => h.id),
    hSize
  );

  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -hSize; // заміни на висоту свого header у px
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };
  return (
    <div className="pl-4 pt-5">
      <h4 className="text-md font-mono font-bold tracking-wide text-fg uppercase">
        {title}
      </h4>
      <ul className="">
        {headings.map((heading) => {
          const isActive = heading.id === activeId;
          return (
            <li
              key={heading.id}
              style={{
                paddingLeft: `${(heading.depth - 1) * 10}px`,
                fontSize: `${1.1 - (heading.depth - 2) * 0.1}rem`,
              }}
              className={`${
                isActive ? "before:bg-accent" : "before:bg-fg/20"
              } before:h-full  before:absolute before:-left-4 before:w-[1px] before:top-1/2 before:-translate-y-1/2 relative transition-all`}
            >
              <button
                onClick={() => scrollToId(heading.id)}
                className={`${
                  isActive ? "text-accent" : "text-fg"
                } hover:underline text-left w-full`}
              >
                {heading.text}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ArticleHeading;
