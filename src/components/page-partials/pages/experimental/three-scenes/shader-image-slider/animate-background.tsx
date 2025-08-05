import { useThreeSliderStore } from "@/storage/three-slider/useSlider";
import { useSpring } from "@react-spring/web";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Color } from "three";

const AnimateBackground = () => {
  const bgColor = useRef<Color>(null);
  const { curSlide, items } = useThreeSliderStore();
  const color = items[curSlide].color;
  const { background } = useSpring({
    background: color,
    config: { tension: 120, friction: 40 },
  });

  useFrame(() => {
    if (bgColor.current) {
      bgColor.current.set(background.get());
    }
  });
  return (
    <>
      <color attach="background" args={[items[0].color]} ref={bgColor} />
    </>
  );
};

export default AnimateBackground;
