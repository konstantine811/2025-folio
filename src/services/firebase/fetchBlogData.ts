import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "@config/firebase.config";
import {
  BlogArticleProps,
  BlogFirebaseCollection,
  PostContent,
  PostCover,
} from "@/types/blog-storage";
import { LanguageType } from "@/i18n";

export const fetchArticle = async (id: string): Promise<PostContent | null> => {
  const docRef = doc(db, BlogFirebaseCollection.articles, id);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    const data = snap.data() as PostContent;
    return data;
  } else {
    console.error("⚠️ Article not found:", id);
    return null;
  }
};

export const fetchTranslatedArticle = async (
  groupId: string,
  lang: LanguageType
): Promise<string | null> => {
  const q = query(
    collection(db, BlogFirebaseCollection.articles),
    where(BlogArticleProps.translationGroupId, "==", groupId),
    where(BlogArticleProps.lang, "==", lang)
  );
  const snap = await getDocs(q);
  if (!snap.empty) {
    return snap.docs[0].id; // Firestore doc ID
  } else {
    console.warn("⚠️ No translation found");
    return null;
  }
};

export const fetchPosts = async (lang: LanguageType): Promise<PostCover[]> => {
  const q = query(
    collection(db, BlogFirebaseCollection.articles),
    where(BlogArticleProps.lang, "==", lang),
    ...(process.env.NODE_ENV === "production"
      ? [where(BlogArticleProps.isPublished, "==", true)]
      : [])
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const rest = d.data() as PostCover;
    return {
      ...rest,
      id: d.id, // Firestore ID
    };
  });
};

export async function getBlogArticleId(
  lang: string,
  topic: string,
  subtopic: string | null,
  title: string
): Promise<string | null> {
  const q = query(
    collection(db, BlogFirebaseCollection.articles),
    where(BlogArticleProps.lang, "==", lang),
    where(BlogArticleProps.topic, "==", topic),
    where(BlogArticleProps.subtopic, "==", subtopic),
    where(BlogArticleProps.title, "==", title)
  );

  const snap = await getDocs(q);

  if (!snap.empty) {
    return snap.docs[0].id; // Повертаємо ID першого знайденого документа
  } else {
    console.error("❌ Статтю не знайдено за вказаними параметрами.");
    return null;
  }
}
