import { getBlogImage } from "@/config/supabaseClient";
import { PostContent } from "@/types/blog-storage";
import dayjs from "dayjs";
import "dayjs/locale/uk";
import "dayjs/locale/en";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { LanguageType } from "@/i18n";

dayjs.locale("uk");

const ArticleCover = ({ article }: { article: PostContent }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  useEffect(() => {
    dayjs.locale(lang === LanguageType.UA ? "uk" : lang);
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
      <div className="relative z-10 w-full grow flex flex-col items-center bg-background-alt/40 backdrop-contrast-150 pt-22 pb-10 md:py-10 px-13">
        <div className="text-fg/80 text-shadow-md max-w-4xl mx-auto text-shadow-background/30">
          <p className="text-xs font-mono tracking-wide text-fg uppercase">
            {dayjs(article.created_at).format(t("date_format"))}
          </p>
          <h1 className="text-[clamp(1.5rem,5vw,3rem)] leading-tight md:text-6xl lg:text-8xl font-extrabold mb-4 break-words text-balance  text-center max-w-screen-md mx-auto px-4">
            {article.title}
          </h1>

          <p className="text-xl lg:text-3xl inline-block w-auto p-2 rounded-xs overflow-hidden bg-background-alt/50 backdrop-blur-xl border border-background">
            {article.description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ArticleCover;
