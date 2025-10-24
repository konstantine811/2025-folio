import { useSoundEnabledStore } from "@/storage/soundEnabled";
import {
  selectSound,
  selectedSound,
  whooshSound,
  selectSound_3,
  selectSound_2,
  buttonClickSound,
  menuOpenSound,
} from "@config/sounds";
import { SoundTypeElement } from "@custom-types/sound";
import { useHoverStore } from "@storage/hoverStore";

let lastType: SoundTypeElement | null = null;
let lastTime = 0;
const SOUND_THROTTLE_MS = 50;

export function subscribeToHoverSound() {
  useHoverStore.subscribe((state) => {
    const isSoundEnabled = useSoundEnabledStore.getState().isSoundEnabled;
    if (!isSoundEnabled) return;

    const now = Date.now();

    const isSameType = state.hoverTypeElement === lastType;
    const isThrottled = now - lastTime < SOUND_THROTTLE_MS;

    // 🔇 НЕ граємо звук при повторному enter/leave з тією ж самою кнопкою
    if (isSameType && isThrottled) return;

    lastType = state.hoverTypeElement;
    lastTime = now;

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
        case SoundTypeElement.SHIFT:
          buttonClickSound.play("first");
          break;
        case SoundTypeElement.OPEN:
          menuOpenSound.play();
          break;
      }
    } else {
      // 🧠 не граємо end звук, якщо вже було false
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
          break;
        case SoundTypeElement.SHIFT:
          buttonClickSound.stop();
          whooshSound.play("second");
          break;
        case SoundTypeElement.OPEN:
          menuOpenSound.stop();
          break;
      }
    }
  });
}
