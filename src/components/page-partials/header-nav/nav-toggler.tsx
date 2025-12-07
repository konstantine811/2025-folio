import { useSoundEnabledStore } from "@/storage/soundEnabled";
import BurgerMenu from "@components/ui-abc/burger-menu";
import { SoundTypeElement } from "@custom-types/sound";
import { useClickStore } from "@storage/clickStore";
import { useNavMenuStore } from "@storage/navMenuStore";
import { useEffect } from "react";

const NavToggler = () => {
  const { isOpen, setOpen } = useNavMenuStore((state) => state);
  const setClick = useClickStore((state) => state.setClick);
  const isSoundEnabled = useSoundEnabledStore((state) => state.isSoundEnabled);

  useEffect(() => {
    if (isSoundEnabled) {
      if (isOpen) {
        setClick(SoundTypeElement.OPEN);
      } else {
        setClick(SoundTypeElement.BUTTON);
      }
    }
  }, [isOpen, isSoundEnabled, setClick]);
  return (
    <>
      <div
        className="h-full w-full relative select-none flex items-center justify-center pb-2"
        onClick={() => {
          setOpen(!isOpen);
        }}
      >
        <BurgerMenu isOpen={isOpen} />
      </div>
    </>
  );
};

export default NavToggler;
