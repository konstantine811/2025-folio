import { useSoundEnabledStore } from "@/storage/soundEnabled";
import BurgerMenu from "@components/ui-abc/burger-menu";
import { SoundTypeElement } from "@custom-types/sound";
import { useClickStore } from "@storage/clickStore";
import { useEffect } from "react";
import { useNavMenuScope } from "@/storage/scoped-nav-menu-store";

const RevealButton = () => {
  const { isOpen, setOpen } = useNavMenuScope("map");
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
        className="h-14 select-none pointer-events-auto flex relative bottom-3 left-5"
        onClick={() => {
          setOpen(!isOpen);
        }}
      >
        <BurgerMenu isOpen={isOpen} isEqualWidth={true} width={35} />
      </div>
    </>
  );
};

export default RevealButton;
