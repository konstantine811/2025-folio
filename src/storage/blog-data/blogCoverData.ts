// store/postsStore.ts
import { LanguageType } from "@/i18n";
import {
  fetchArticle,
  fetchPosts,
  fetchTranslatedArticle,
} from "@/services/firebase/fetchBlogData";

import { PostContent, PostCover, PostEntity } from "@custom-types/blog-storage";
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
  fetchArticle: (id: string) => Promise<PostContent | null>;
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
    id: string,
    lang: LanguageType
  ) => Promise<string | null>;
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
  fetchTranslatedArticle: async (id: string, lang: LanguageType) => {
    const data = await fetchTranslatedArticle(id, lang);
    if (!data) {
      console.error("Translation not found");
      return null;
    }
    return data;
  },
  fetchArticle: async (id: string) => {
    const state = get(); // отримуємо поточний стан стора

    // 1. Перевірка чи вже є в articles
    if (state.articles[id]) {
      return state.articles[id];
    }
    const data = await fetchArticle(id.toString());
    if (data) {
      state.articles[id] = data;
      return data;
    }
    return null;
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
    const data = await fetchPosts(lang);

    if (data) {
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
      set({ loading: false });
    }
  },
}));
