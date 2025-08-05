import { useAtom } from "jotai";
import {
  CAKE_TRANSITION_DURATION,
  cakeAtom,
  cakes,
  isMobileAtom,
  screenAtom,
  TRANSITION_DURATION,
  transitionAtom,
} from "./config/ui.config";
import { useControls } from "leva";
import { useEffect, useRef, useState } from "react";
import { useSpring, animated } from "@react-spring/three";
import { degToRad, MathUtils } from "three/src/math/MathUtils.js";
import { ContactShadows, Float, Gltf } from "@react-three/drei";
import TransitionModel from "./transition-model";
import { MeshBasicMaterial } from "three";
import { useFrame } from "@react-three/fiber";

const Experience = () => {
  const [cake, setCake] = useAtom(cakeAtom);
  const [screen] = useAtom(screenAtom);
  const [transition] = useAtom(transitionAtom);
  const { groundColor } = useControls({
    groundColor: { value: "#4e35b5" },
  });
  const [isMobile] = useAtom(isMobileAtom);
  const materialShadowHide = useRef<MeshBasicMaterial>(null);
  const [fadeOutShadows, setFadeOutShadows] = useState(false);
  const isHome = !transition && screen === "home";
  const { scale, positionX, rotationY } = useSpring({
    from: {
      scale: isMobile ? 0.9 : 0.75,
      positionX: 0,
      rotationY: degToRad(-90),
    },
    to: {
      scale: isHome ? (isMobile ? 0.75 : 1) : isMobile ? 0.9 : 1.15,
      positionX: isHome ? (isMobile ? 0 : -1.5) : 0,
      rotationY: isHome ? degToRad(-42) : degToRad(-90),
    },
    config: {
      duration: isHome ? 1200 : 1000,
    },
    delay: isHome ? (TRANSITION_DURATION - 0.3) * 1000 : 0,
  });

  useEffect(() => {
    setFadeOutShadows(true);
    const timeout = setTimeout(() => {
      setFadeOutShadows(false);
    }, CAKE_TRANSITION_DURATION * 1.42 * 1000);
    return () => clearTimeout(timeout);
  }, [cake]);

  useFrame(() => {
    if (materialShadowHide.current) {
      materialShadowHide.current.opacity = MathUtils.lerp(
        materialShadowHide.current.opacity,
        fadeOutShadows ? 1 : 0,
        0.02
      );
    }
  });

  useEffect(() => {
    setCake(screen === "menu" ? 0 : -1);
  }, [screen, setCake]);
  return (
    <group position-y={isMobile ? -0.66 : -1}>
      {/* HOME */}
      <group visible={screen === "home"}>
        <animated.group
          scale={scale}
          position-x={positionX}
          rotation-y={rotationY}
        >
          <Gltf
            src={"/3d-models/shader-transition-model/juice_carton_shop.glb"}
            scale={0.72}
          />
        </animated.group>
      </group>
      {/* MENU */}
      <group position-y={isMobile ? 0.42 : 0.75} visible={screen === "menu"}>
        <Float scale={isMobile ? 0.75 : 1}>
          {cakes.map((cakeItem, index) => {
            return (
              <TransitionModel
                key={index}
                model={cakeItem.model}
                scale={cakeItem.scale}
                visible={index === cake}
              />
            );
          })}
        </Float>
      </group>
      <ContactShadows opacity={0.42} scale={25} />
      <mesh rotation-x={degToRad(-90)} position-y={0.001}>
        <planeGeometry args={[40, 40]} />
        <meshBasicMaterial
          ref={materialShadowHide}
          color={groundColor}
          opacity={0}
          transparent
          toneMapped={false}
        />
      </mesh>
      <mesh rotation-x={degToRad(-90)} position-y={-0.001}>
        <planeGeometry args={[40, 40]} />
        <meshBasicMaterial color={groundColor} toneMapped={false} />
      </mesh>
    </group>
  );
};

export default Experience;
