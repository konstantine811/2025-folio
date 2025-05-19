import SoundHoverElement from "../../../ui-abc/sound-hover-element";
import { SoundTypeElement } from "@custom-types/sound";
import SelectItem from "../../../ui-abc/select/select-item";
import { ThemePalette, ThemeType } from "@config/theme-colors.config";
import { buttonClickSound2 } from "@config/sounds";
import { LocalStorageKey } from "@config/local-storage.config";
import { getConicGradientFromTheme, setTheme } from "@utils/color-picker.util";
import { useThemeStore } from "@storage/themeStore";
import { TestTubeDiagonal } from "lucide-react";
import { useSoundEnabledStore } from "@/storage/soundEnabled";

const ColorPicker = () => {
  const setThemeStore = useThemeStore((state) => state.onSetTheme);
  const selectedTheme = useThemeStore((state) => state.selectedTheme);
  const isSoundEnabled = useSoundEnabledStore((state) => state.isSoundEnabled);

  return (
    <SelectItem
      dropPosition={{
        x: 9,
        y: 3,
      }}
      selectNode={<TestTubeDiagonal />}
      renderItems={(itemVariants) =>
        Object.entries(ThemePalette).map(([themeName, themeColors]) => {
          return (
            <SoundHoverElement
              key={themeName}
              variants={itemVariants}
              hoverTypeElement={SoundTypeElement.SELECT}
              hoverAnimType="scale"
              animValue={0.9}
              onClick={() => {
                if (isSoundEnabled) {
                  buttonClickSound2.play("first");
                }
                setTheme(themeColors);
                setThemeStore(themeName as ThemeType);
                localStorage.setItem(
                  LocalStorageKey.theme,
                  JSON.stringify(themeName)
                );
              }}
              as="li"
            >
              <div
                className={`w-7 h-7 rounded-full p-2 ${
                  themeName === selectedTheme
                    ? "border-4 border-primary"
                    : "border-none border-transparent"
                }`}
                style={{ background: getConicGradientFromTheme(themeColors) }}
              />
            </SoundHoverElement>
          );
        })
      }
    />
  );
};

export default ColorPicker;
