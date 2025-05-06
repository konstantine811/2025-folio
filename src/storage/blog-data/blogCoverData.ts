// store/postsStore.ts
import { LanguageType } from "@/i18n";
import { supabase } from "@config/supabaseClient";
import {
  BlogArticleProps,
  BlogSupabaseTable,
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
  loading: boolean;
  fetchPosts: (lang: LanguageType, allTopics: string) => Promise<void>;
};

export const usePostsStore = create<PostsStore>((set) => ({
  posts: null,
  loading: false,
  uniqueTopics: null,
  postsEntity: {},
  fetchPosts: async (lang, allTopics) => {
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
