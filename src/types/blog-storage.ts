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
}

export interface PostCover {
  id: number;
  title: string;
  topic: string;
  subtopic: string;
  created_at: string;
  cover: string;
  description: string;
}

export interface PostContent extends PostCover {
  content: string;
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
