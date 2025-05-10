import { LanguageType } from "@/i18n";
import { usePostsStore } from "@/storage/blog-data/blogCoverData";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export const ALL_TOPICS_TITLE = "blog.topics.all";
const useFetchPosts = () => {
  const fetchPosts = usePostsStore((state) => state.fetchPosts);
  const { i18n } = useTranslation();
  const lang = i18n.language as LanguageType;
  useEffect(() => {
    fetchPosts(lang, ALL_TOPICS_TITLE); // завжди викликати, коли змінюється lang
  }, [lang, fetchPosts]); // слідкуємо за lang!
  return null;
};

export default useFetchPosts;
