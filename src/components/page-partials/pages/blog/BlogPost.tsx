import { useHeaderSizetore } from "@/storage/headerSizeStore";
import { PostEntity } from "@/types/blog-storage";

const BlogPost = ({ postEntity }: { postEntity: PostEntity }) => {
  const hSize = useHeaderSizetore((state) => state.size);
  return (
    <>
      {Object.entries(postEntity).map(([topic, subtopics]) => {
        return (
          <div key={topic}>
            <h2
              className="bg-background-alt p-6 text-fg uppercase sticky font-bold"
              style={{ top: hSize }}
            >
              {topic}
            </h2>
            <ul className="container mx-auto">
              {Object.entries(subtopics).map(([subtopic, posts]) => (
                <li className="text-fg" key={subtopic}>
                  <h3>{subtopic}</h3>
                  <ul className="flex gap-2">
                    {posts.map((post) => (
                      <li
                        className="border border-fg text-fg rounded-2xl p-6"
                        key={post.id}
                      >
                        <h4>{post.title}</h4>
                        <p>{post.description}</p>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </>
  );
};

export default BlogPost;
