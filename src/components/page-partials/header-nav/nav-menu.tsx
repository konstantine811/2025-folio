import NavToggler from "./nav-toggler";
import RevealNavMenu from "./reveal-nav-menu";
import HeaderBanner from "./header-banner";
import { useIsAdoptive } from "@/hooks/useIsAdoptive";
import Login from "./login";
import useEnvSoundToPath from "@/hooks/sound/useEnvSoundToPath";

export default function NavMenu() {
  const { isAdoptiveSize: isMdSize } = useIsAdoptive();

  useEnvSoundToPath();
  return (
    <div className="relative md:max-w-md w-full m-2">
      <div className="bg-card rounded-2xl">
        <div className="relative z-20 flex items-center justify-between  gap-4 w-full  px-5   py-2">
          <div className="flex items-center gap-2">
            <Login />
          </div>
          {isMdSize && (
            <div className="text-sm text-foreground/70 font-mono tracking-wide text-center">
              <HeaderBanner />
            </div>
          )}
          <NavToggler />
        </div>
        {/* show menu */}
        <RevealNavMenu />
      </div>
    </div>
  );
}
