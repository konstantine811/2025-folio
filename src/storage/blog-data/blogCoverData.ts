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

function collectPostEntity(postEnity: PostEntity, post: PostCover) {
  const { topic, subtopic } = post;
  if (!postEnity[topic]) {
    postEnity[topic] = {};
  }
  if (!postEnity[topic][subtopic]) {
    postEnity[topic][subtopic] = [];
  }
  postEnity[topic][subtopic].push(post);
}

type PostsStore = {
  posts: PostCover[] | null;
  postsEntity: PostEntity;
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
};

export const usePostsStore = create<PostsStore>((set, get) => ({
  posts: null,
  loading: false,
  uniqueTopics: null,
  postsEntity: {},
  articles: {},
  activeTopic: {
    topic: "",
    subtopics: {},
  },
  setActiveTopic: (topic, subtopics) => {
    set({ activeTopic: { topic, subtopics } });
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
    const state = get();
    if (Object.keys(state.postsEntity).length) {
      return;
    }
    set({ loading: true });

    const { data, error } = await supabase
      .from(BlogSupabaseTable.articles)
      .select(
        `${BlogArticleProps.id}, ${BlogArticleProps.title}, ${BlogArticleProps.topic}, ${BlogArticleProps.subtopic}, ${BlogArticleProps.createdAt}, ${BlogArticleProps.cover}, ${BlogArticleProps.description}`
      )
      .eq(BlogArticleProps.lang, lang === LanguageType.UA ? "uk" : lang);
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
      set({ postsEntity: postEntity });
      // set posts
      set({ posts: data, loading: false });
    } else {
      console.error(error);
      set({ loading: false });
    }
  },
}));
