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
    if (isSoundEnabled && isOpen) {
      setClick(SoundTypeElement.OPEN);
    }
  }, [isOpen, isSoundEnabled, setClick]);
  return (
    <>
      <div
        className="h-12 w-12 flex items-center justify-center relative select-none"
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
