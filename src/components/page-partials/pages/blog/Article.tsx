import { usePostsStore } from "@/storage/blog-data/blogCoverData";
import { useHeaderSizeStore } from "@/storage/headerSizeStore";
import { useHoverStore } from "@/storage/hoverStore";
import { HoverStyleElement } from "@/types/sound";
import { useEffect } from "react";
import { useParams } from "react-router";

const Article = () => {
  const { id } = useParams(); // Отримуємо ідентифікатор статті з URL
  const hSize = useHeaderSizeStore((state) => state.size);
  const fetchArticle = usePostsStore((state) => state.fetchArticle);
  const setHoverStyle = useHoverStore((s) => s.setHoverStyle);
  const setHover = useHoverStore((s) => s.setHover);
  useEffect(() => {
    setHover(false, null, HoverStyleElement.circle);
  }, [setHoverStyle, setHover]);
  useEffect(() => {
    fetchArticle(Number(id)).then((data) => {
      console.log("Стаття з кешу:", data);
    });
  }, [id, fetchArticle]);
  return (
    <div
      className="bg-background"
      style={{ minHeight: `calc(100vh - ${hSize}px)` }}
    >
      <h1 className="text-fg text-9xl">{id}</h1>
    </div>
  );
};

export default Article;
