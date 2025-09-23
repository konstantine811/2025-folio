import { PositionalAudio } from "@react-three/drei";
import { sfxs } from "./config/audio.config";

const PreloaderAudio = () => {
  return (
    <>
      {Object.values(sfxs).map((src) => (
        <PositionalAudio key={src} url={src} autoplay={false} />
      ))}
    </>
  );
};

export default PreloaderAudio;
