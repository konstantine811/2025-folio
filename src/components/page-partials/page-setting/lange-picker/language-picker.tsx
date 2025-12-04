import SelectItem from "@components/ui-abc/select/select-item";
import SoundHoverElement from "@components/ui-abc/sound-hover-element";
import { buttonClickSound2 } from "@config/sounds";
import { HoverStyleElement, SoundTypeElement } from "@custom-types/sound";
import { LanguageType } from "@/i18n";
import { useTranslation } from "react-i18next";
import { LocalStorageKey } from "@/config/local-storage.config";

const icons = {
  [LanguageType.EN]: "🇬🇧",
  [LanguageType.UA]: "🇺🇦",
};

const LanguagePicker = () => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language as LanguageType;
  return (
    <SelectItem
      dropPosition={{
        x: 12,
        y: 0,
      }}
      selectNode={icons[currentLanguage]}
      renderItems={(itemVariants) =>
        Object.entries(LanguageType).map(([key, value]) => {
          const isSelected = value === currentLanguage;
          return (
            <SoundHoverElement
              key={key}
              variants={itemVariants}
              hoverTypeElement={SoundTypeElement.SELECT}
              hoverStyleElement={HoverStyleElement.none}
              hoverAnimType="scale"
              animValue={0.9}
              onClick={() => {
                if (isSelected) return;
                buttonClickSound2.play("first");
                localStorage.setItem(
                  LocalStorageKey.lang,
                  JSON.stringify(value)
                );
                i18n.changeLanguage(value);
              }}
              as="li"
            >
              <span className="text-md cursor-pointer">{icons[value]}</span>
            </SoundHoverElement>
          );
        })
      }
    />
  );
};

export default LanguagePicker;
