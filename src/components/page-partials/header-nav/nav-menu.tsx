import { useIsAdoptive } from "@/hooks/useIsAdoptive";
import NavToggler from "./nav-toggler";
import RevealNavMenu from "./reveal-nav-menu";
import { BreakPoints } from "@/config/adaptive.config";

export default function NavMenu() {
  const { isAdoptiveSize: isSmSize } = useIsAdoptive(BreakPoints.sm);
  return (
    <>
      <div className="w-full h-full relative cursor-pointer">
        <NavToggler />
      </div>
      {!isSmSize && <RevealNavMenu />}
    </>
  );
}
