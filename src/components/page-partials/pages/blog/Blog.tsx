import SelectTabs from "@components/ui-abc/select-tabs/select-tabs";
import { usePostsStore } from "@storage/blog-data/blogCoverData";
import { useEffect, useState } from "react";
import Preloader from "../../preloader/preloader";
import { PostEntity } from "@/types/blog-storage";
import BlogPost from "./BlogPost";
import { useHeaderSizeStore } from "@/storage/headerSizeStore";
import useFetchPosts, { ALL_TOPICS_TITLE } from "@/hooks/useFetchPosts";

const Blog = () => {
  const { postsEntity, loading, uniqueTopics } = usePostsStore();

  const hSize = useHeaderSizeStore((state) => state.size);
  const [selectedPostEnity, setSelectedPostEntity] =
    useState<PostEntity>(postsEntity);

  useFetchPosts();

  useEffect(() => {
    if (postsEntity) {
      setSelectedPostEntity(postsEntity);
    }
  }, [postsEntity]);

  return (
    <div
      className="bg-background pb-10"
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
                  if (item === ALL_TOPICS_TITLE) {
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
