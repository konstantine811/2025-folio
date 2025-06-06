import { LanguageType } from "@/i18n";

export enum BlogSupabaseTable {
  articles = "articles-blog",
  articlesImage = "blog-articles-images",
  articlesImageFolder = "blog-images",
}

export enum BlogArticleProps {
  id = "id",
  title = "title",
  createdAt = "created_at",
  cover = "cover",
  description = "description",
  topic = "topic",
  subtopic = "subtopic",
  content = "content",
  translationGroupId = "translation_group_id",
  lang = "lang",
  sortPosition = "sort_position",
  isPublished = "is_published",
}

export interface PostCover {
  id: string;
  title: string;
  topic: string;
  subtopic: string;
  created_at: {
    seconds: number;
    nanoseconds: number;
  };
  updated_at: {
    seconds: number;
    nanoseconds: number;
  };
  cover: string;
  description: string;
  sort_position: number;
  is_published: boolean;
}

export interface PostContent extends PostCover {
  content: string;
  lang: LanguageType;
  translation_group_id: string;
}

export interface PostEntity {
  [key: string]: {
    [key: string]: PostCover[];
  };
}

export interface IArticleHeading {
  depth: number;
  text: string;
  id: string;
}
