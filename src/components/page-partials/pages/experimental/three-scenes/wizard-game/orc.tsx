import { useAnimations, useGLTF } from "@react-three/drei";
import { JSX, useEffect, useMemo, useRef, useState } from "react";
import { SkeletonUtils } from "three/examples/jsm/Addons.js";
import { IOrk } from "./hooks/useMagic";
import { Group, LoopOnce, Mesh } from "three";
import { useFrame } from "@react-three/fiber";

type Props = JSX.IntrinsicElements["group"] & {
  orc: IOrk;
};

const Orc = ({ orc, ...props }: Props) => {
  const { scene, animations } = useGLTF("/3d-models/wizard-model/Orc.glb");
  const clonedScene = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const ref = useRef<Group>(null);
  const [animation, setAnimation] = useState("CharacterArmature|Walk");
  const { actions } = useAnimations(animations, ref);
  const healthBar = useRef<Mesh>(null);

  useEffect(() => {
    clonedScene.traverse((child) => {
      if (child.type === "Mesh") {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [clonedScene]);

  useEffect(() => {
    if (actions?.["CharacterArmature|Death"]) {
      actions["CharacterArmature|Death"].setLoop(LoopOnce, 1);
      actions["CharacterArmature|Death"].clampWhenFinished = true;
    }
    if (actions?.["CharacterArmature|HitReact"]) {
      actions["CharacterArmature|HitReact"].setLoop(LoopOnce, 1);
      actions["CharacterArmature|HitReact"].clampWhenFinished = true;
    }
  }, [actions]);

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

  useFrame(() => {
    if (animation !== orc.animation) {
      setAnimation(orc.animation);
    }
    if (ref.current) {
      if (ref.current.position.distanceTo(orc.position) < 1) {
        ref.current.position.lerp(orc.position, 0.1);
      } else {
        ref.current.position.copy(orc.position);
      }
    }
    if (healthBar.current) {
      healthBar.current.scale.x = (1 * orc.health) / 100;
    }
  });

  return (
    <group {...props} ref={ref} position={orc.position}>
      <mesh position-y={3.5} ref={healthBar}>
        <planeGeometry args={[1, 0.1]} />
        <meshBasicMaterial color="red" />
      </mesh>
      <primitive object={clonedScene} />
    </group>
  );
};

export default Orc;

useGLTF.preload("/3d-models/wizard-model/Orc.glb");
