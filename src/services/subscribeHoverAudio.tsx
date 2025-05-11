import { useSoundEnabledStore } from "@/storage/soundEnabled";
import {
  selectSound,
  selectedSound,
  whooshSound,
  selectSound_3,
  selectSound_2,
} from "@config/sounds";
import { SoundTypeElement } from "@custom-types/sound";
import { useHoverStore } from "@storage/hoverStore";

export function subscribeToHoverSound() {
  useHoverStore.subscribe((state) => {
    const isSoundEnabled = useSoundEnabledStore.getState().isSoundEnabled;
    if (!isSoundEnabled) return; // не виконуємо звуки, якщо вимкнено
    if (state.isHovering) {
      whooshSound.stop();
      switch (state.hoverTypeElement) {
        case SoundTypeElement.BUTTON:
        case SoundTypeElement.LINK:
          selectedSound.play("first");
          break;
        case SoundTypeElement.SELECT:
          selectSound_2.play("first");
          break;
        case SoundTypeElement.SELECT_2:
          selectSound_3.play("first");
          break;
        case SoundTypeElement.LOGO:
          selectSound.play("second");
          break;
      }
    } else {
      switch (state.hoverTypeElement) {
        case SoundTypeElement.BUTTON:
        case SoundTypeElement.LINK:
          selectedSound.stop();
          whooshSound.play("second");
          break;
        case SoundTypeElement.SELECT:
          selectSound_2.stop();
          break;
        case SoundTypeElement.LOGO:
          selectSound.stop();
          whooshSound.play("second");
          break;
        case SoundTypeElement.SELECT_2:
          selectSound_3.stop();
          whooshSound.play("second");
      }
    }
  });
}
