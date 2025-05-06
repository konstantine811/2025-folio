import SelectItem from "@components/ui-abc/select/select-item";
import SoundHoverElement from "@components/ui-abc/sound-hover-element";
import { buttonClickSound2 } from "@config/sounds";
import { SoundTypeElement } from "@custom-types/sound";
import { LanguageType } from "@/i18n";
import { useTranslation } from "react-i18next";
import en from "/icon/png/england.png";
import ua from "/icon/png/ukraine.png";
import { LocalStorageKey } from "@/config/local-storage.config";

const icons = {
  [LanguageType.EN]: en,
  [LanguageType.UA]: ua,
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
      selectNode={<img className="w-6 h-6" src={icons[currentLanguage]} />}
      renderItems={(itemVariants) =>
        Object.entries(LanguageType).map(([key, value]) => {
          const isSelected = value === currentLanguage;
          return (
            <SoundHoverElement
              key={key}
              variants={itemVariants}
              hoverTypeElement={SoundTypeElement.SELECT}
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
              <img
                className={`w-6 h-6 ${
                  isSelected
                    ? "border-2 border-accent rounded-full opacity-30"
                    : ""
                }`}
                src={icons[value]}
              />
            </SoundHoverElement>
          );
        })
      }
    />
  );
};

export default LanguagePicker;
