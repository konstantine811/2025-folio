import ColorPicker from "@components/ui-abc/select/color-picker";
import NavMenu from "./nav-menu";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 border-b backdrop-blur-md  bg-transparent">
      <div className="grid grid-cols-3">
        <NavMenu />
        <div className="text-white text-center ">2025 folio</div>
        <div className="text-white text-right pr-4 flex items-center justify-end">
          <ColorPicker />
        </div>
      </div>
    </header>
  );
};

export default Header;
