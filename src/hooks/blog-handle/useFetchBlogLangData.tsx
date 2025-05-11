import { LanguageType } from "@/i18n";
import { usePostsStore } from "@/storage/blog-data/blogCoverData";
import { PostEntity } from "@/types/blog-storage";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const useFetchBlogLangData = () => {
  const postsLangEntity = usePostsStore((state) => state.postsLangEntity);
  const { i18n } = useTranslation();
  const lang = i18n.language as LanguageType;
  const [postsEntity, setPostsEntity] = useState<PostEntity>(
    postsLangEntity[lang]
  );

  useEffect(() => {
    setPostsEntity(postsLangEntity[lang]);
  }, [lang, postsLangEntity]);
  return postsEntity;
};

export default useFetchBlogLangData;
