import { BlogSupabaseTable } from "@/types/blog-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export const getBlogImage = (imgPath: string) => {
  const cleaned = imgPath.replace(/^!\[\[|\]\]$/g, "").trim();
  const { data } = supabase.storage
    .from(BlogSupabaseTable.articlesImage)
    .getPublicUrl(`${BlogSupabaseTable.articlesImageFolder}/${cleaned}`);

  return data.publicUrl;
};
