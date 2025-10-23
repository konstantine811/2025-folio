import SoundHoverElement from "@components/ui-abc/sound-hover-element";

import NavToggler from "./nav-toggler";
import RevealNavMenu from "./reveal-nav-menu";

import { HoverStyleElement, SoundTypeElement } from "@custom-types/sound";
import HeaderBanner from "./header-banner";
import { useIsAdoptive } from "@/hooks/useIsAdoptive";
import Login from "./login";
import LogoAnimated from "@/components/ui-abc/logo";
import useTransitionRouteTo from "@/hooks/useRouteTransitionTo";
import { RoutPath } from "@/config/router-config";
import useEnvSoundToPath from "@/hooks/sound/useEnvSoundToPath";

export default function NavMenu() {
  const { isAdoptiveSize: isMdSize } = useIsAdoptive();
  const navigateTo = useTransitionRouteTo();
  useEnvSoundToPath();
  return (
    <div className="relative md:max-w-md w-full m-2">
      <div className="relative  z-20 flex items-center justify-between bg-muted-foreground/45 gap-4 w-full rounded-2xl px-5  backdrop-blur-xs py-2">
        <div className="flex items-center gap-2">
          <SoundHoverElement
            hoverTypeElement={SoundTypeElement.NONE}
            hoverStyleElement={HoverStyleElement.none}
            className="w-12 flex items-center justify-center relative px-2 py-3"
            hoverAnimType="translate"
            onClick={() => {
              navigateTo(RoutPath.HOME);
            }}
          >
            <LogoAnimated />
          </SoundHoverElement>
          {isMdSize && <Login />}
        </div>
        {isMdSize && (
          <div className="text-sm text-foreground/70 font-mono tracking-wide text-center">
            <HeaderBanner />
          </div>
        )}
        <SoundHoverElement
          hoverStyleElement={HoverStyleElement.none}
          hoverAnimType="scale"
          className="caret-transparent"
        >
          <NavToggler />
        </SoundHoverElement>
      </div>
      {/* show menu */}
      <RevealNavMenu />
    </div>
  );
}
