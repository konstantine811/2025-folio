import SoundHoverElement from "@components/ui-abc/sound-hover-element";

import NavToggler from "./nav-toggler";
import RevealNavMenu from "./reveal-nav-menu";
import LogoAnimated from "./logo";
import { SoundTypeElement } from "@custom-types/sound";

export default function NavMenu() {
  return (
    <div className="relative md:max-w-md w-full">
      <div className="relative z-20 flex items-center justify-between gap-4 w-full bg-background-alt/90 px-5  backdrop-blur-2xl py-2">
        <SoundHoverElement
          hoverTypeElement={SoundTypeElement.LOGO}
          className="w-12 flex items-center justify-center relative px-2 py-3"
          hoverAnimType="translate"
        >
          <LogoAnimated />
        </SoundHoverElement>
        <SoundHoverElement hoverAnimType="scale">
          <NavToggler />
        </SoundHoverElement>
      </div>
      {/* show menu */}
      <RevealNavMenu />
    </div>
  );
}
