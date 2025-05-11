import { usePostsStore } from "@/storage/blog-data/blogCoverData";
import { useHeaderSizeStore } from "@/storage/headerSizeStore";
import { useHoverStore } from "@/storage/hoverStore";
import { HoverStyleElement } from "@/types/sound";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { IArticleHeading, PostContent } from "@/types/blog-storage";
import { extractHeadingsFromMarkdown } from "@/utils/markdown-pars.util";
import ParseMarkdown from "./ParseMarkdown";
import Preloader from "@components/page-partials/preloader/preloader";
import ArticleCover from "./ArticleCover";
import ArticleHeading from "./ArticleHeading";
import TopicBlogDrawer from "./TopicBlogDrawer";
import useFetchPosts from "@/hooks/blog-handle/useFetchPosts";
import ScrollProgressBar from "@/components/common/scroll-progress-bar";
import useFetchBlogLangData from "@/hooks/blog-handle/useFetchBlogLangData";
import { useTranslation } from "react-i18next";
import { LanguageType } from "@/i18n";
import { RoutPath } from "@/config/router-config";

const Article = () => {
  const scrollRef = useRef<HTMLDivElement>(null!);
  const { id } = useParams(); // Отримуємо ідентифікатор статті з URL
  const hSize = useHeaderSizeStore((state) => state.size);
  const fetchArticle = usePostsStore((state) => state.fetchArticle);
  const setActiveTopic = usePostsStore((state) => state.setActiveTopic);
  const [loading, setLoading] = useState(false);
  const fetchTranslatedArticle = usePostsStore(
    (state) => state.fetchTranslatedArticle
  );
  const { i18n } = useTranslation();
  const lang = i18n.language;
  const postsEntity = useFetchBlogLangData();
  const setHoverStyle = useHoverStore((s) => s.setHoverStyle);
  const setHover = useHoverStore((s) => s.setHover);
  const [article, setArticle] = useState<PostContent | null>(null);
  const [headings, setHeadings] = useState<IArticleHeading[]>([]);
  const navigate = useNavigate();
  useFetchPosts();

  const fetchArticleById = useCallback(
    (id: number | string | undefined) => {
      fetchArticle(Number(id)).then((data) => {
        setArticle(data);
        const headings = extractHeadingsFromMarkdown(data.content);
        setHeadings(headings);
        setLoading(false);
      });
    },
    [fetchArticle]
  );
  useEffect(() => {
    setHover(false, null, HoverStyleElement.circle);
  }, [setHoverStyle, setHover]);
  useEffect(() => {
    setLoading(true);
    fetchArticleById(id);
  }, [id, fetchArticleById]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [id]);

  useEffect(() => {
    if (article && article.lang !== lang) {
      setLoading(true);
      fetchTranslatedArticle(
        article.translation_group_id,
        lang as LanguageType
      ).then((id) => {
        if (id) {
          navigate(`${RoutPath.BLOG}/${id}`);
        } else {
          console.error("Translation not found");
          setTimeout(() => {
            setLoading(false);
            navigate(RoutPath.BLOG);
          }, 700);
        }
      });
    }
  }, [lang, article, fetchTranslatedArticle, navigate]);

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
      ref={scrollRef}
      style={{ minHeight: `calc(100vh - ${hSize}px)` }}
    >
      {scrollRef.current && <ScrollProgressBar target={scrollRef} />}
      <TopicBlogDrawer />
      {!loading ? (
        article && (
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
        )
      ) : (
        <Preloader />
      )}
    </div>
  );
};

export default Article;
