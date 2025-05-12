import SoundHoverElement from "@/components/ui-abc/sound-hover-element";
import WrapperHoverElement from "@/components/ui-abc/wrapper-hover-element";
import { RoutPath } from "@/config/router-config";
import { riserSound, shinySound } from "@/config/sounds";
import { usePostsStore } from "@/storage/blog-data/blogCoverData";
import { useSoundEnabledStore } from "@/storage/soundEnabled";
import { useTransitionStore } from "@/storage/transitionRoutePath";
import { HoverStyleElement } from "@/types/sound";
import { useNavigate, useParams } from "react-router";

const TopicBlogDrawerContent = ({ onClose }: { onClose: () => void }) => {
  const { id } = useParams(); // Отримуємо ідентифікатор статті з URL
  const activeTopic = usePostsStore((state) => state.activeTopic);
  const navigate = useNavigate();
  const isSoundEnabled = useSoundEnabledStore((state) => state.isSoundEnabled);
  const onTransition = useTransitionStore((state) => state.onIsTransition);
  return (
    <>
      <h3 className="text-2xl text-fg font-bold my-4 mx-4">
        📂 {activeTopic.topic}
      </h3>
      <div>
        {Object.entries(activeTopic.subtopics).map(([subtopic, posts]) => (
          <div key={subtopic} className="">
            {subtopic !== "null" && (
              <h4 className="text-2xl text-accent font-bold bg-background-alt p-4">
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
                const isActive = post.id === Number(id);
                return (
                  <SoundHoverElement
                    hoverStyleElement={HoverStyleElement.quad}
                    animValue={0.95}
                    as="li"
                    key={post.id}
                    className={`${
                      isActive
                        ? "cursor-none pointer-events-none bg-accent text-fg-muted "
                        : "cursor-pointer pointer-events-auto text-fg last:border-0 border-b border-background"
                    }  text-lg  py-2 cursor-pointer pl-5 transition-background duration-1000`}
                    onClick={() => {
                      if (isActive) return; // якщо стаття активна, нічого не робимо
                      onTransition(true); // 🔥 запускаємо лише якщо маршрут інший
                      if (isSoundEnabled) {
                        riserSound.play("first");
                        shinySound.play("first");
                      }
                      onClose();
                      setTimeout(() => {
                        navigate(`${RoutPath.BLOG}/${post.id}`);
                      }, 700);
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
