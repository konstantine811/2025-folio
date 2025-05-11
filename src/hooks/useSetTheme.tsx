import { LocalStorageKey } from "@/config/local-storage.config";
import { ThemePalette, ThemeType } from "@/config/theme-colors.config";
import { useThemeStore } from "@/storage/themeStore";
import { setTheme } from "@/utils/color-picker.util";
import { useEffect } from "react";

const useSetTheme = () => {
  const setThemeStore = useThemeStore((state) => state.onSetTheme);
  useEffect(() => {
    const storedTheme = localStorage.getItem(LocalStorageKey.theme);
    if (storedTheme) {
      const parsedTheme = JSON.parse(storedTheme) as keyof typeof ThemePalette;
      const themeColors = ThemePalette[parsedTheme];
      setTheme(themeColors);
      setThemeStore(parsedTheme);
    } else {
      const defaultTheme = ThemeType.DARK;
      setThemeStore(defaultTheme);
      setTheme(ThemePalette[defaultTheme]);
    }
  }, [setThemeStore]);
};

export default useSetTheme;
