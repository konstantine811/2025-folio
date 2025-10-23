import ColorPicker from "@components/page-partials/page-setting/color-picker/color-picker";
import NavMenu from "./nav-menu";
import { memo, useEffect, useRef } from "react";
import { useHeaderSizeStore } from "@storage/headerSizeStore";
import LanguagePicker from "../page-setting/lange-picker/language-picker";
import ToggleSound from "../page-setting/toggle-sound";
import { useIsAdoptive } from "@/hooks/useIsAdoptive";
import Login from "./login";

const Header = memo(() => {
  const headerRef = useRef<HTMLDivElement>(null!);
  const setHeaderSize = useHeaderSizeStore((state) => state.setHeaderSize);
  const { isAdoptiveSize: isMdSize } = useIsAdoptive();
  useEffect(() => {
    if (headerRef.current) {
      const headerHeight = headerRef.current.getBoundingClientRect().height;
      setHeaderSize(headerHeight);
    }
  }, [headerRef, setHeaderSize]);
  return (
    <header
      ref={headerRef}
      className="fixed top-0 z-40 w-full container mx-auto left-0 right-0"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 items-center">
        {!isMdSize && (
          <div className="text-foreground pr-4 items-center flex">
            <Login />
          </div>
        )}
        <div className="flex justify-end items-center">
          <ColorPicker />
          <LanguagePicker />
          <ToggleSound />
          <NavMenu />
        </div>
      </div>
    </header>
  );
});

export default Header;
