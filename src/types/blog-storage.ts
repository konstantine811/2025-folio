export enum BlogSupabaseTable {
  articles = "articles-blog",
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
  id: string;
  title: string;
  topic: string;
  subtopic: string;
  created_at: string;
  cover: string;
  description: string;
}

export interface PostEntity {
  [key: string]: {
    [key: string]: PostCover[];
  };
}
