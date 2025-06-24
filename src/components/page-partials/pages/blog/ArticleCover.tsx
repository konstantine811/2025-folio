import { getBlogImage } from "@/config/supabaseClient";
import { PostContent } from "@/types/blog-storage";
import dayjs from "dayjs";
import "dayjs/locale/uk";
import "dayjs/locale/en";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

import { getDateFnsLocaleCode } from "@/utils/lang";

dayjs.locale("uk");

const ArticleCover = ({ article }: { article: PostContent }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  useEffect(() => {
    dayjs.locale(getDateFnsLocaleCode(lang));
  }, [lang]);
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
      <div className="relative z-10 w-full grow flex flex-col items-center  pt-22 pb-10 md:py-10 px-4">
        <div className="text-foreground max-w-4xl mx-auto bg-card/30 backdrop-blur-xs rounded-lg p-2">
          <p className="text-xs font-mono tracking-wide uppercase">
            {dayjs(article.created_at.seconds * 1000).format(t("date_format"))}
          </p>
          <h1 className="text-[clamp(1.5rem,5vw,3rem)] leading-tight md:text-6xl lg:text-8xl font-extrabold mb-4 break-words text-balance  text-center max-w-screen-md mx-auto px-4">
            {article.title}
          </h1>

          <p className="text-xl lg:text-2xl inline-block w-auto p-2 font-monospace font-normal rounded-xs overflow-hidden">
            {article.description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ArticleCover;
