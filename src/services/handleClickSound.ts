import { buttonClickSound } from "@config/sounds";
import { SoundTypeElement } from "@custom-types/sound";

export function switchPlaySound(sound: SoundTypeElement) {
  switch (sound) {
    case SoundTypeElement.BUTTON:
      buttonClickSound.play("first");
      break;
    case SoundTypeElement.LOGO:
      buttonClickSound.play("first");
      break;
  }
}
