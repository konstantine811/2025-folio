import { JSX, useEffect, useRef, useState } from "react";
import { initPath, ModelTeamMember } from "./config";
import { Group, LoopOnce } from "three";
import { useAnimations, useGLTF } from "@react-three/drei";

interface Props {
  props?: JSX.IntrinsicElements["group"];
  modelName?: ModelTeamMember;
}
const TeamMember = ({ props, modelName = ModelTeamMember.casual }: Props) => {
  const group = useRef<Group>(null!);
  const { scene, animations } = useGLTF(`${initPath}/${modelName}.gltf`);
  const { actions, mixer } = useAnimations(animations, group);
  const [animation, setAnimation] = useState<string>("Idle");

  useEffect(() => {
    actions[animation]?.reset().fadeIn(0.2).play();

    return () => {
      actions[animation]?.fadeOut(0.2);
    };
  }, [animation, actions]);

  useEffect(() => {
    if (actions["Wave"]) {
      actions["Wave"].clampWhenFinished = true;
      actions["Wave"].loop = LoopOnce;
    }
  }, [actions]);

  useEffect(() => {
    const onAnimationFinised = () => {
      setAnimation("Idle");
    };
    mixer.addEventListener("finished", onAnimationFinised);
    return () => {
      mixer.removeEventListener("finished", onAnimationFinised);
    };
  }, [mixer]);

  return (
    <group
      ref={group}
      {...props}
      onPointerEnter={() => {
        setAnimation("Wave");
      }}
    >
      <primitive object={scene} />
    </group>
  );
};

export default TeamMember;

useGLTF.preload(`${initPath}/${ModelTeamMember.casual}.gltf`);
useGLTF.preload(`${initPath}/${ModelTeamMember.formal}.gltf`);
useGLTF.preload(`${initPath}/${ModelTeamMember.suit}.gltf`);
