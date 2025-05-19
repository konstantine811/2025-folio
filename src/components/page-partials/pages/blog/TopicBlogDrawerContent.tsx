import SoundHoverElement from "@/components/ui-abc/sound-hover-element";
import WrapperHoverElement from "@/components/ui-abc/wrapper-hover-element";
import { RoutPath } from "@/config/router-config";
import useTransitionRouteTo from "@/hooks/useRouteTransitionTo";
import { usePostsStore } from "@/storage/blog-data/blogCoverData";
import { useTransitionStore } from "@/storage/transitionRoutePath";
import { HoverStyleElement } from "@/types/sound";
import { useParams } from "react-router";

const TopicBlogDrawerContent = ({ onClose }: { onClose: () => void }) => {
  const { id } = useParams(); // Отримуємо ідентифікатор статті з URL
  const activeTopic = usePostsStore((state) => state.activeTopic);
  const navigateTo = useTransitionRouteTo();
  const onTransition = useTransitionStore((state) => state.onIsTransition);
  return (
    <>
      <h3 className="text-2xl text-foreground font-bold my-4 mx-4">
        📂 {activeTopic.topic}
      </h3>
      <div>
        {Object.entries(activeTopic.subtopics).map(([subtopic, posts]) => (
          <div key={subtopic} className="">
            {subtopic !== "null" && (
              <h4 className="text-2xl text-primary font-bold bg-card p-4">
                {subtopic}
              </h4>
            )}
            <WrapperHoverElement
              as="ol"
              className={`${
                posts.length > 1 ? "list-decimal list-inside" : "list-none"
              }`}
            >
              {posts.map((post) => {
                const isActive = post.id === id;
                return (
                  <SoundHoverElement
                    hoverStyleElement={HoverStyleElement.quad}
                    animValue={0.95}
                    as="li"
                    key={post.id}
                    className={`${
                      isActive
                        ? "cursor-none pointer-events-none bg-primary text-background"
                        : "cursor-pointer pointer-events-auto text-foreground last:border-0 border-b border-background"
                    }  text-lg  py-2 cursor-pointer pl-5 transition-background duration-1000`}
                    onClick={() => {
                      if (isActive) return; // якщо стаття активна, нічого не робимо
                      onTransition(true); // 🔥 запускаємо лише якщо маршрут інший
                      navigateTo(`${RoutPath.BLOG}/${post.id}`);
                      onClose();
                    }}
                  >
                    {post.title}
                  </SoundHoverElement>
                );
              })}
            </WrapperHoverElement>
          </div>
        ))}
      </div>
    </>
  );
};

export default TopicBlogDrawerContent;
