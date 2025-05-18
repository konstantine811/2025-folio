import { supabase } from "@/config/supabaseClient";
import { LanguageType } from "@/i18n";
import {
  BlogArticleProps,
  BlogSupabaseTable,
  PostCover,
} from "@/types/blog-storage";

export const fetchArticle = async (id: string) => {
  const { data, error } = await supabase
    .from(BlogSupabaseTable.articles)
    .select("*") // отримуємо всі поля
    .eq(BlogArticleProps.id, id)
    .single(); // фільтр по id

  if (error) {
    console.error("Помилка при отриманні статті:", error);
  } else {
    return data;
  }
};

export const fetchTranslatedArticle = async (
  groupId: string,
  lang: LanguageType
) => {
  const { data, error } = await supabase
    .from(BlogSupabaseTable.articles)
    .select(BlogArticleProps.id) // отримуємо всі поля
    .eq(BlogArticleProps.translationGroupId, groupId)
    .eq(BlogArticleProps.lang, lang)
    .single(); // фільтр по id

  if (error) {
    console.error("Помилка при отриманні статті:", error);
    return null;
  } else {
    return data.id;
  }
};

export const fetchPosts = async (lang: LanguageType): Promise<PostCover[]> => {
  let query = supabase
    .from(BlogSupabaseTable.articles)
    .select(
      `${BlogArticleProps.id}, ${BlogArticleProps.title}, ${BlogArticleProps.topic}, ${BlogArticleProps.subtopic}, ${BlogArticleProps.createdAt}, ${BlogArticleProps.cover}, ${BlogArticleProps.description}, ${BlogArticleProps.sortPosition}, ${BlogArticleProps.isPublished}`
    )
    .eq(BlogArticleProps.lang, lang);

  if (process.env.NODE_ENV === "production") {
    query = query.eq(BlogArticleProps.isPublished, true);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Помилка при отриманні статті:", error);
    return [];
  }
  return data as PostCover[];
};
