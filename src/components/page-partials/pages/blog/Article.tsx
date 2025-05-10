import { usePostsStore } from "@/storage/blog-data/blogCoverData";
import { useHeaderSizeStore } from "@/storage/headerSizeStore";
import { useHoverStore } from "@/storage/hoverStore";
import { HoverStyleElement } from "@/types/sound";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { IArticleHeading, PostContent } from "@/types/blog-storage";
import { extractHeadingsFromMarkdown } from "@/utils/markdown-pars.util";
import ParseMarkdown from "./ParseMarkdown";
import Preloader from "@components/page-partials/preloader/preloader";
import ArticleCover from "./ArticleCover";
import ArticleHeading from "./ArticleHeading";
import TopicBlogDrawer from "./TopicBlogDrawer";
import useFetchPosts from "@/hooks/useFetchPosts";

const Article = () => {
  const { id } = useParams(); // Отримуємо ідентифікатор статті з URL
  const hSize = useHeaderSizeStore((state) => state.size);
  const fetchArticle = usePostsStore((state) => state.fetchArticle);
  const setActiveTopic = usePostsStore((state) => state.setActiveTopic);
  const postsEntity = usePostsStore((state) => state.postsEntity);
  const setHoverStyle = useHoverStore((s) => s.setHoverStyle);
  const setHover = useHoverStore((s) => s.setHover);
  const [article, setArticle] = useState<PostContent | null>(null);
  const [headings, setHeadings] = useState<IArticleHeading[]>([]);
  useFetchPosts();
  useEffect(() => {
    setHover(false, null, HoverStyleElement.circle);
  }, [setHoverStyle, setHover]);
  useEffect(() => {
    fetchArticle(Number(id)).then((data) => {
      setArticle(data);
      const headings = extractHeadingsFromMarkdown(data.content);
      setHeadings(headings);
    });
  }, [id, fetchArticle]);

  useEffect(() => {
    // Якщо postsEntity вже завантажено, то знаходимо активний розділ
    // і підрозділи для статті
    if (postsEntity) {
      Object.entries(postsEntity).forEach(([topic, subtopics]) => {
        const isCurrent = Object.entries(subtopics).some(([, posts]) => {
          return posts.some((post) => post.id === Number(id));
        });
        if (isCurrent) {
          setActiveTopic(topic, subtopics);
        }
      });
    }
  }, [id, postsEntity, setActiveTopic]);

  return (
    <div
      className="bg-background pb-20 relative"
      style={{ minHeight: `calc(100vh - ${hSize}px)` }}
    >
      <TopicBlogDrawer />
      {article ? (
        <>
          <ArticleCover article={article} />
          <div className="grid grid-cols-8 gap-4 px-5 sm:px-10">
            {/* Ліва частина — стаття */}
            <div className="col-span-8 lg:col-start-3 lg:col-span-4 text-fg flex-1">
              <ParseMarkdown content={article.content} />
            </div>

            {/* Права частина — закріплений CONTENT */}
            <div className="hidden lg:block col-span-2 relative">
              {headings.length && (
                <div className="sticky" style={{ top: `${hSize}px` }}>
                  <ArticleHeading headings={headings} />
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <Preloader />
      )}
    </div>
  );
};

export default Article;
