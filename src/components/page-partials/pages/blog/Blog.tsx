import { LanguageType } from "@/i18n";
import SelectTabs from "@components/ui-abc/select-tabs/select-tabs";
import { usePostsStore } from "@storage/blog-data/blogCoverData";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Preloader from "../../preloader/preloader";
import { PostEntity } from "@/types/blog-storage";
import BlogPost from "./BlogPost";
import { useHeaderSizetore } from "@/storage/headerSizeStore";

const Blog = () => {
  const { postsEntity, loading, fetchPosts, uniqueTopics } = usePostsStore();

  const hSize = useHeaderSizetore((state) => state.size);
  const [selectedPostEnity, setSelectedPostEntity] =
    useState<PostEntity>(postsEntity);

  const { i18n } = useTranslation();
  const lang = i18n.language as LanguageType;
  const allTopics = "blog.topics.all";

  useEffect(() => {
    if (postsEntity) {
      setSelectedPostEntity(postsEntity);
    }
  }, [postsEntity]);

  useEffect(() => {
    fetchPosts(lang, allTopics); // завжди викликати, коли змінюється lang
  }, [lang, fetchPosts]); // слідкуємо за lang!

  return (
    <div
      className="bg-background"
      style={{ minHeight: `calc(100vh - ${hSize}px)` }}
    >
      {loading ? (
        <Preloader />
      ) : (
        <>
          <div className="container mx-auto">
            {uniqueTopics && (
              <SelectTabs
                items={uniqueTopics}
                onSelectItem={(item) => {
                  if (item === allTopics) {
                    setSelectedPostEntity(postsEntity);
                  } else {
                    setSelectedPostEntity({ [item]: postsEntity[item] });
                  }
                }}
              />
            )}
          </div>
          <BlogPost postEntity={selectedPostEnity} />
        </>
      )}
    </div>
  );
};

export default Blog;
