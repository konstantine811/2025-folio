import SoundHoverElement from "@/components/ui-abc/sound-hover-element";
import WrapperHoverElement from "@/components/ui-abc/wrapper-hover-element";
import { useHeaderSizetore } from "@/storage/headerSizeStore";
import { PostCover } from "@/types/blog-storage";
import { SoundTypeElement } from "@/types/sound";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

const TopicBlogPost = ({
  topic,
  subtopics,
}: {
  topic: string;
  subtopics: { [key: string]: PostCover[] };
}) => {
  const hSize = useHeaderSizetore((state) => state.size);
  const [t] = useTranslation();
  const [selectedSubtopic, setSelectedSubtopic] = useState<string | null>(null);
  const refTopic = useRef<HTMLDivElement>(null!);
  const [offsetTopic, setOffsetTopic] = useState<number>(0);
  useEffect(() => {
    console.log(
      "refTopic.current.offsetHeight",
      refTopic.current.getBoundingClientRect()
    );
    const { height } = refTopic.current.getBoundingClientRect();
    setOffsetTopic(height + hSize + 5);
  }, [refTopic, hSize]);
  return (
    <>
      <div
        ref={refTopic}
        className="bg-background-alt p-6 sticky top-0 flex gap-2 items-center z-10"
        style={{ top: hSize }}
      >
        <h2 className="text-fg text-2xl uppercase font-bold">{topic}</h2>
        {Object.keys(subtopics).length > 1 && (
          <WrapperHoverElement as="div" className="flex items-center">
            <SoundHoverElement
              hoverAnimType="scale"
              hoverTypeElement={SoundTypeElement.SELECT_2}
              as="h6"
              className={`text-fg hover:underline  hover:cursor-pointer p-3 ${
                selectedSubtopic === null ? "underline decoration-accent" : ""
              }`}
              onClick={() => setSelectedSubtopic(null)}
            >
              /{t("blog.topics.all_subtopics")}
            </SoundHoverElement>
            {Object.keys(subtopics).map((subtopic) => (
              <SoundHoverElement
                hoverAnimType="scale"
                hoverTypeElement={SoundTypeElement.SELECT_2}
                as="h6"
                className={`text-fg hover:underline  hover:cursor-pointer p-3 ${
                  selectedSubtopic === subtopic
                    ? "underline decoration-accent"
                    : ""
                }`}
                key={subtopic}
                onClick={() => {
                  setSelectedSubtopic(subtopic);
                }}
              >
                /{subtopic}
              </SoundHoverElement>
            ))}
          </WrapperHoverElement>
        )}
      </div>
      <ul className="container mx-auto">
        {Object.entries(subtopics)
          .filter(([subtopics]) => {
            if (selectedSubtopic === null) {
              return true;
            }
            return subtopics === selectedSubtopic;
          })
          .map(([subtopic, posts]) => (
            <li className="text-fg m-4" key={subtopic}>
              {subtopic !== "null" && (
                <h3
                  className={
                    "inline-block text-fg font-bold uppercase ml-10 p-4 m-2 sticky"
                  }
                  style={{
                    top: offsetTopic,
                  }}
                >
                  {subtopic}:
                </h3>
              )}

              <ul className="flex gap-2">
                {posts.map((post) => (
                  <li className="border border-fg text-fg p-6" key={post.id}>
                    <h4>{post.title}</h4>
                    <p>{post.description}</p>
                  </li>
                ))}
              </ul>
            </li>
          ))}
      </ul>
    </>
  );
};

export default TopicBlogPost;
