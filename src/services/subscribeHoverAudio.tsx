import {
  buttonHoverSound,
  buttonHoverOutSound,
  selectSound,
  buttonHoverSound2,
} from "@config/sounds";
import { SoundTypeElement } from "@custom-types/sound";
import { useHoverStore } from "@storage/hoverStore";

export function subscribeToHoverSound() {
  useHoverStore.subscribe((state) => {
    if (state.isHovering) {
      switch (state.hoverTypeElement) {
        case SoundTypeElement.BUTTON:
        case SoundTypeElement.LINK:
          buttonHoverOutSound.stop();
          buttonHoverSound.play();
          break;
        case SoundTypeElement.SELECT:
          buttonHoverSound2.stop();
          buttonHoverSound2.play("first");
          break;
        case SoundTypeElement.LOGO:
          selectSound.stop();
          selectSound.play("second");
          break;
      }
    } else {
      switch (state.hoverTypeElement) {
        case SoundTypeElement.BUTTON:
        case SoundTypeElement.LINK:
          buttonHoverSound.stop();
          buttonHoverOutSound.play();
          break;
        case SoundTypeElement.LOGO:
          selectSound.stop();
          selectSound.play("third");
          break;
      }
    }
  });
}
