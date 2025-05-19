import SoundHoverElement from "@/components/ui-abc/sound-hover-element";
import WrapperHoverElement from "@/components/ui-abc/wrapper-hover-element";
import { useHeaderSizeStore } from "@/storage/headerSizeStore";
import { PostCover } from "@/types/blog-storage";
import { HoverStyleElement, SoundTypeElement } from "@/types/sound";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import BlocCard from "./BlocCard";
import { useIsAdoptive } from "@/hooks/useIsAdoptive";

const TopicBlogPost = ({
  topic,
  subtopics,
}: {
  topic: string;
  subtopics: { [key: string]: PostCover[] };
}) => {
  const hSize = useHeaderSizeStore((state) => state.size);
  const isMdSize = useIsAdoptive();
  const [t] = useTranslation();
  const [selectedSubtopic, setSelectedSubtopic] = useState<string | null>(null);
  const refTopic = useRef<HTMLDivElement>(null!);
  const [offsetTopic, setOffsetTopic] = useState<number>(0);
  useEffect(() => {
    const { height } = refTopic.current.getBoundingClientRect();
    setOffsetTopic(height + hSize);
  }, [refTopic, hSize]);
  return (
    <div>
      <div
        ref={refTopic}
        className="bg-card p-6 md:sticky top-0 flex flex-wrap gap-2 items-center z-10 bottom-0"
        style={{ top: hSize }}
      >
        <h2 className="text-foreground text-2xl uppercase font-bold">
          {topic}
        </h2>
        {Object.keys(subtopics).length > 1 && (
          <WrapperHoverElement as="div" className="flex flex-wrap items-center">
            <SoundHoverElement
              hoverAnimType="scale"
              hoverTypeElement={SoundTypeElement.SELECT_2}
              hoverStyleElement={HoverStyleElement.quad}
              as="h6"
              className={`text-foreground hover:underline  hover:cursor-pointer p-3 ${
                selectedSubtopic === null ? "underline decoration-primary" : ""
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
                className={`text-foreground hover:underline  hover:cursor-pointer p-3 ${
                  selectedSubtopic === subtopic
                    ? "underline decoration-primary"
                    : ""
                }`}
                key={subtopic}
                onClick={() => {
                  setSelectedSubtopic(subtopic);
                }}
              >
                / {subtopic !== "null" ? subtopic : t("blog.subtopics.common")}
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
            <li className="text-foreground m-4" key={subtopic}>
              {subtopic !== "null" && (
                <h3
                  className={
                    "bg-card/5 backdrop-blur-2xl inline-block text-foreground font-bold uppercase p-4 sticky z-1"
                  }
                  style={{
                    top: isMdSize ? hSize : offsetTopic,
                  }}
                >
                  {subtopic}:
                </h3>
              )}

              <WrapperHoverElement
                as="ul"
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
              >
                {posts.map((post) => {
                  return <BlocCard key={post.id} post={post} />;
                })}
              </WrapperHoverElement>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default TopicBlogPost;
