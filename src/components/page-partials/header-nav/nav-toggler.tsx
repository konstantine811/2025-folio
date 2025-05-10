import { useHoverStore } from "@/storage/hoverStore";
import BurgerMenu from "@components/ui-abc/burger-menu";
import { SoundTypeElement } from "@custom-types/sound";
import { useClickStore } from "@storage/clickStore";
import { useNavMenuStore } from "@storage/navMenuStore";

const NavToggler = () => {
  const { isOpen, setOpen } = useNavMenuStore((state) => state);
  const setClick = useClickStore((state) => state.setClick);
  const isSoundEnabled = useHoverStore((state) => state.isSoundEnabled);

  return (
    <>
      <div
        className="h-12 w-12 flex items-center justify-center relative"
        onClick={() => {
          if (isSoundEnabled) {
            setClick(SoundTypeElement.BUTTON);
          }
          setOpen(!isOpen);
        }}
      >
        <BurgerMenu isOpen={isOpen} />
      </div>
    </>
  );
};

export default NavToggler;
