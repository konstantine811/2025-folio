import SoundHoverElement from "@/components/ui-abc/sound-hover-element";
import WrapperHoverElement from "@/components/ui-abc/wrapper-hover-element";
import { useHeaderSizetore } from "@/storage/headerSizeStore";
import { PostCover } from "@/types/blog-storage";
import { HoverStyleElement, SoundTypeElement } from "@/types/sound";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import BlocCard from "./BlocCard";

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
              hoverStyleElement={HoverStyleElement.quad}
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
                hoverStyleElement={HoverStyleElement.quad}
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
                    "bg-background-alt/5 backdrop-blur-2xl inline-block text-fg font-bold uppercase ml-10 p-4 m-2 sticky"
                  }
                  style={{
                    top: offsetTopic,
                  }}
                >
                  {subtopic}:
                </h3>
              )}

              <WrapperHoverElement
                as="ul"
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
              >
                {posts.map((post) => (
                  <BlocCard key={post.id} post={post} />
                ))}
              </WrapperHoverElement>
            </li>
          ))}
      </ul>
    </>
  );
};

export default TopicBlogPost;
