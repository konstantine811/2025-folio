import {
  ThemeToggleButton,
  useThemeTransition,
} from "@/components/ui/shadcn-io/theme-toggle-button";
import { LocalStorageKey } from "@/config/local-storage.config";
import { revealSound } from "@/config/sounds";
import { ThemePalette, ThemeType } from "@/config/theme-colors.config";
import { useSoundEnabledStore } from "@/storage/soundEnabled";
import { useThemeStore } from "@/storage/themeStore";
import { setTheme } from "@/utils/color-picker.util";

const ThemeToggle = () => {
  const setThemeStore = useThemeStore((state) => state.onSetTheme);
  const selectedTheme = useThemeStore((state) => state.selectedTheme);
  const isSoundEnabled = useSoundEnabledStore((state) => state.isSoundEnabled);

  const { startTransition } = useThemeTransition();
  return (
    <div className="flex flex-col items-center gap-2">
      <ThemeToggleButton
        className="border-none hover:bg-accent/20 duration-300 rounded-full"
        theme={selectedTheme}
        onClick={() => {
          if (isSoundEnabled) {
            revealSound.play();
          }

          const currentThemeName =
            selectedTheme === ThemeType.DARK ? ThemeType.LIGHT : ThemeType.DARK;
          startTransition(() => {
            setTheme(ThemePalette[currentThemeName]);
            setThemeStore(currentThemeName);
            localStorage.setItem(
              LocalStorageKey.theme,
              JSON.stringify(currentThemeName)
            );
          });
        }}
        variant="circle-blur"
        start="top-left"
      />
    </div>
  );
};

export default ThemeToggle;
