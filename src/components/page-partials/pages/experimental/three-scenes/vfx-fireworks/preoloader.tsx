import { PositionalAudio } from "@react-three/drei";

const Preloader = () => {
  return (
    <>
      <PositionalAudio
        url="/sound/fireworks/firecracker-corsair.mp3"
        autoplay={false}
      />
      <PositionalAudio
        url="/sound/fireworks/firework-whistle.mp3"
        autoplay={false}
      />
    </>
  );
};

export default Preloader;
