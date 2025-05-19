import ColorPicker from "@components/page-partials/page-setting/color-picker/color-picker";
import NavMenu from "./nav-menu";
import { memo, useEffect, useRef } from "react";
import { useHeaderSizeStore } from "@storage/headerSizeStore";
import LanguagePicker from "../page-setting/lange-picker/language-picker";
import HeaderBanner from "./header-banner";
import ToggleSound from "../page-setting/toggle-sound";
import { useIsAdoptive } from "@/hooks/useIsAdoptive";
import Login from "./login";

const Header = memo(() => {
  const headerRef = useRef<HTMLDivElement>(null!);
  const setHeaderSize = useHeaderSizeStore((state) => state.setHeaderSize);
  const isMdSize = useIsAdoptive();
  useEffect(() => {
    if (headerRef.current) {
      const headerHeight = headerRef.current.getBoundingClientRect().height;
      setHeaderSize(headerHeight);
    }
  }, [headerRef, setHeaderSize]);
  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 border-b backdrop-blur-md  bg-background"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 items-center">
        <NavMenu />
        {!isMdSize && (
          <div className="text-foreground/70 font-mono tracking-wide text-center">
            <HeaderBanner />
          </div>
        )}

        {!isMdSize && (
          <div className="text-foreground pr-4 items-center justify-end flex">
            <ToggleSound />
            <ColorPicker />
            <LanguagePicker />
            <Login />
          </div>
        )}
      </div>
    </header>
  );
});

export default Header;
