import LogoAnimated from "@/components/ui-abc/logo";
import SoundHoverElement from "@/components/ui-abc/sound-hover-element";
import { RoutPath } from "@/config/router-config";
import useTransitionRouteTo from "@/hooks/useRouteTransitionTo";
import { HoverStyleElement, SoundTypeElement } from "@/types/sound";

const LogoHomeNav = () => {
  const navigateTo = useTransitionRouteTo();
  return (
    <SoundHoverElement
      hoverTypeElement={SoundTypeElement.SELECT}
      hoverStyleElement={HoverStyleElement.none}
      className="w-12 flex items-center justify-center relative px-2 py-3"
      hoverAnimType="translate"
      onClick={() => {
        navigateTo(RoutPath.HOME);
      }}
    >
      <LogoAnimated />
    </SoundHoverElement>
  );
};

export default LogoHomeNav;
