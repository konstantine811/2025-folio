import { BlogArticleProps, BlogSupabaseTable } from "@/types/blog-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
// const gitHubURL = "https://raw.githubusercontent.com/konstantine811";
// const gitHubBlogImages = "blog-data/master/blog-images";
const cloudFareURLBlogImages =
  "https://pub-47d64eea07d246f7889849111c96c26f.r2.dev";
export const supabase = createClient(supabaseUrl, supabaseKey);

// export const getBlogImage = (imgPath: string) => {
//   const cleaned = imgPath.replace(/^!\[\[|\]\]$/g, "").trim();
//   const { data } = supabase.storage
//     .from(BlogSupabaseTable.articlesImage)
//     .getPublicUrl(`${BlogSupabaseTable.articlesImageFolder}/${cleaned}`);

//   return data.publicUrl;
// };

export const getBlogImage = (imgPath: string) => {
  const cleaned = imgPath.replace(/^!\[\[|\]\]$/g, "").trim();
  return `${cloudFareURLBlogImages}/${encodeURIComponent(cleaned)}`;
};

export async function getBlogArticleId(
  lang: string,
  topic: string,
  subtopic: string | null,
  title: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from(BlogSupabaseTable.articles)
    .select(BlogArticleProps.id) // отримуємо всі поля
    .eq(BlogArticleProps.lang, lang)
    .eq(BlogArticleProps.topic, topic)
    .eq(BlogArticleProps.subtopic, subtopic)
    .eq(BlogArticleProps.title, title)
    .single();

  if (error || !data) {
    console.error("❌ Error fetching article ID:", error);
    return null;
  }

  return data.id;
}
