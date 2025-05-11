import { getBlogImage } from "@/config/supabaseClient";
import { PostCover } from "@/types/blog-storage";
import LogoAnimated from "../../header-nav/logo";
import SoundHoverElement from "@/components/ui-abc/sound-hover-element";
import { HoverStyleElement, SoundTypeElement } from "@/types/sound";
import { useNavigate } from "react-router";
import { RoutPath } from "@/config/router-config";
import { useTransitionStore } from "@/storage/transitionRoutePath";
import { riserSound, shinySound } from "@/config/sounds";

import { useSoundEnabledStore } from "@/storage/soundEnabled";

const BlocCard = ({ post }: { post: PostCover }) => {
  const navigate = useNavigate();
  const onTransition = useTransitionStore((state) => state.onIsTransition);
  const isSoundEnabled = useSoundEnabledStore((state) => state.isSoundEnabled);

  return (
    <SoundHoverElement
      hoverAnimType="scale"
      animValue={0.97}
      hoverTypeElement={SoundTypeElement.SELECT}
      hoverStyleElement={HoverStyleElement.quad}
      as="li"
      className="bg-background-alt text-fg rounded-xs overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col h-full"
      onClick={() => {
        onTransition(true); // 🔥 запускаємо лише якщо маршрут інший
        if (isSoundEnabled) {
          riserSound.play("first");
          shinySound.play("first");
        }
        setTimeout(() => {
          navigate(`${RoutPath.BLOG}/${post.id}`);
        }, 700);
      }}
    >
      <div className="w-full h-48 flex items-center justify-center">
        {post.cover ? (
          <img
            className="object-cover w-full h-48"
            src={getBlogImage(post.cover)}
            alt={post.title}
          />
        ) : (
          <div className="w-15 flex items-center justify-center h-full">
            <LogoAnimated />
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-grow bg-background-alt/15 backdrop-blur-2xl">
        <h4 className="text-lg font-semibold mb-2">{post.title}</h4>
        <p className="text-sm text-muted flex-grow">{post.description}</p>
      </div>
    </SoundHoverElement>
  );
};

export default BlocCard;
