import { useAnimations, useGLTF } from "@react-three/drei";
import { JSX, useEffect, useRef, useState } from "react";
import { LoopOnce, Object3D } from "three";
import { useMagicStore } from "./hooks/useMagic";
import { createPortal } from "@react-three/fiber";
import VFXEmitter from "../vfx-engine/vfxs/vfx-emitter";

type Props = JSX.IntrinsicElements["group"] & {};

const Wizard = (props: Props) => {
  const [animation, setAnimation] = useState("CharacterArmature|Idle");
  const { scene, animations, nodes } = useGLTF(
    `/3d-models/wizard-model/Animated Wizard.glb`
  );
  const ref = useRef<Object3D>(null);
  const { actions } = useAnimations(animations, ref);
  const spell = useMagicStore((state) => state.spell);
  const isCasting = useMagicStore((state) => state.isCasting);
  const gameStatus = useMagicStore((state) => state.gameStatus);

  if (actions?.["CharacterArmature|Death"]) {
    actions["CharacterArmature|Death"].setLoop(LoopOnce, 1);
    actions["CharacterArmature|Death"].clampWhenFinished = true;
  }

  useEffect(() => {
    if (gameStatus === "gameover") {
      setAnimation("CharacterArmature|Death");
    } else if (isCasting) {
      switch (spell.name) {
        case "void":
          setAnimation("CharacterArmature|Spell2");
          break;
        default:
          setAnimation("CharacterArmature|Staff_Attack");
      }
    } else {
      setAnimation("CharacterArmature|Idle_Attacking");
    }
  }, [isCasting, spell, gameStatus]);

  useEffect(() => {
    const action = actions[animation];
    if (!action) {
      return;
    }
    action.reset().fadeIn(0.5).play();
    return () => {
      action.fadeOut(0.5);
    };
  }, [animation, actions]);

  useEffect(() => {
    scene.traverse((child) => {
      if (child.type === "Mesh") {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);

  return (
    <group {...props}>
      <primitive ref={ref} object={scene} />
      {nodes.Wizard_Staff &&
        isCasting &&
        createPortal(
          <VFXEmitter
            position-y={-0.01}
            emitter="sparks"
            position-x={0}
            settings={{
              nbParticles: 500,
              colorStart: spell.colors,
              size: [0.01, 0.05],
              directionMin: [-0.5, 0.5, -0.5],
              directionMax: [0.5, 0.5, 0.5],
              speed: [0, 1],
              startPositionMin: [-0.05, -0.05, -0.05],
              startPositionMax: [0.05, 0.05, 0.05],
              loop: true,
            }}
          />,
          nodes.Wizard_Staff
        )}
    </group>
  );
};

export default Wizard;
