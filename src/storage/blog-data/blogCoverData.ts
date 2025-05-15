// store/postsStore.ts
import { LanguageType } from "@/i18n";
import { supabase } from "@config/supabaseClient";
import {
  BlogArticleProps,
  BlogSupabaseTable,
  PostContent,
  PostCover,
  PostEntity,
} from "@custom-types/blog-storage";
import { create } from "zustand";

function collectPostEntity(postEntity: PostEntity, post: PostCover) {
  const { topic, subtopic } = post;
  if (!postEntity[topic]) {
    postEntity[topic] = {};
  }
  if (!postEntity[topic][subtopic]) {
    postEntity[topic][subtopic] = [];
  }
  postEntity[topic][subtopic].push(post);
  postEntity[topic][subtopic].sort((a, b) => a.sort_position - b.sort_position);
}

type PostsStore = {
  postsLangEntity: { [key in LanguageType]: PostEntity };
  uniqueTopics: string[] | null;
  fetchArticle: (id: number) => Promise<PostContent>;
  articles: { [key: string]: PostContent };
  activeTopic: {
    topic: string;
    subtopics: { [key: string]: PostCover[] };
  };
  loading: boolean;
  setActiveTopic: (
    topic: string,
    subtopics: { [key: string]: PostCover[] }
  ) => void;
  fetchPosts: (lang: LanguageType, allTopics: string) => Promise<void>;
  fetchTranslatedArticle: (
    id: number,
    lang: LanguageType
  ) => Promise<number | null>;
};

export const usePostsStore = create<PostsStore>((set, get) => ({
  posts: null,
  loading: false,
  uniqueTopics: null,
  postsLangEntity: {
    [LanguageType.UA]: {},
    [LanguageType.EN]: {},
  },
  articles: {},
  activeTopic: {
    topic: "",
    subtopics: {},
  },
  setActiveTopic: (topic, subtopics) => {
    set({ activeTopic: { topic, subtopics } });
  },
  fetchTranslatedArticle: async (id: number, lang: LanguageType) => {
    const { data, error } = await supabase
      .from(BlogSupabaseTable.articles)
      .select(BlogArticleProps.id) // отримуємо всі поля
      .eq(BlogArticleProps.translationGroupId, id)
      .eq(BlogArticleProps.lang, lang)
      .single(); // фільтр по id

    if (error) {
      console.error("Помилка при отриманні статті:", error);
      return null;
    } else {
      return data.id;
    }
  },
  fetchArticle: async (id: number) => {
    const state = get(); // отримуємо поточний стан стора

    // 1. Перевірка чи вже є в articles
    if (state.articles[id]) {
      return state.articles[id];
    }
    const { data, error } = await supabase
      .from(BlogSupabaseTable.articles)
      .select("*") // отримуємо всі поля
      .eq(BlogArticleProps.id, id)
      .single(); // фільтр по id

    if (error) {
      console.error("Помилка при отриманні статті:", error);
    } else {
      state.articles[id] = data; // зберігаємо статтю в кеш
      return data;
    }
  },
  fetchPosts: async (lang, allTopics) => {
    set({ loading: true });
    const state = get(); // отримуємо поточний стан стора
    if (
      state.postsLangEntity[lang] &&
      Object.keys(state.postsLangEntity[lang]).length
    ) {
      set({ loading: false });
      return;
    }
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
    if (!error && data) {
      // set unique topics
      const uniqueTopics = [
        allTopics,
        ...new Set(data.map((post) => post.topic)),
      ];
      set({ uniqueTopics });
      // collect posts entity;
      const postEntity: PostEntity = {};
      data.forEach((post) => {
        collectPostEntity(postEntity, post);
      });
      set({
        postsLangEntity: {
          ...state.postsLangEntity,
          [lang]: postEntity,
        },
        loading: false,
      }); // set posts
      // set posts
    } else {
      console.error(error);
      set({ loading: false });
    }
  },
}));
