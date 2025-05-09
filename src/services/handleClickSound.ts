import {
  buttonClickSound,
  buttonClickSound3,
  selectSound_2,
  selectSound_3,
} from "@config/sounds";
import { SoundTypeElement } from "@custom-types/sound";

export function switchPlaySound(sound: SoundTypeElement) {
  switch (sound) {
    case SoundTypeElement.BUTTON:
      buttonClickSound.play("first");
      break;
    case SoundTypeElement.LOGO:
      buttonClickSound.play("first");
      break;
    case SoundTypeElement.SELECT_2:
      selectSound_3.stop();
      buttonClickSound3.play("first");
      break;
    case SoundTypeElement.SELECT:
      selectSound_2.stop();
  }
}
