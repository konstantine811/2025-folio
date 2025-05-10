import { getBlogImage } from "@/config/supabaseClient";
import { PostContent } from "@/types/blog-storage";
import dayjs from "dayjs";
import "dayjs/locale/uk";

dayjs.locale("uk");

const ArticleCover = ({ article }: { article: PostContent }) => {
  return (
    <div
      className={`${
        article.cover ? "min-h-[50vh]" : ""
      } flex flex-col items-center justify-center relative  h-full mb-10 lg:mb-20`}
    >
      {article.cover && (
        <img
          src={getBlogImage(article.cover)}
          alt={article.title}
          className="absolute mb-4 last:mb-0 mx-auto object-cover object-center h-full w-full"
          loading="lazy"
        />
      )}
      <div className="relative z-10 w-full grow flex flex-col items-center bg-background-alt/40 backdrop-contrast-150 pt-22 pb-10 md:py-10 px-10">
        <div className="text-link/50 text-shadow-md  text-shadow-background/20">
          <p className="text-xs font-mono tracking-wide text-fg uppercase">
            {dayjs(article.created_at).format("D MMMM YYYY [о] HH:mm")}
          </p>
          <h1 className="text-6xl md:text-8xl font-extrabold  mb-4">
            {article.title}
          </h1>
          <p className="text-3xl inline-block w-auto p-2 rounded-xs overflow-hidden">
            {article.description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ArticleCover;
