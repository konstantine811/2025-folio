import { PostEntity } from "@/types/blog-storage";
import TopicBlogPost from "./TopicBlogPost";

const BlogPost = ({ postEntity }: { postEntity: PostEntity }) => {
  return (
    <>
      {Object.entries(postEntity).map(([topic, subtopics]) => {
        return (
          <TopicBlogPost key={topic} topic={topic} subtopics={subtopics} />
        );
      })}
    </>
  );
};

export default BlogPost;
