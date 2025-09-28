import { Mesh, Object3D } from "three";
import { useAnimations, useGLTF } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import { SkeletonUtils } from "three/examples/jsm/Addons.js";

const CharacterCloneModel = ({
  path,
  position,
  scale = 1,
  animation,
}: {
  path: string;
  position?: [number, number, number];
  scale?: number;
  animation?: string;
}) => {
  const { scene, animations } = useGLTF(path);
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { actions } = useAnimations(animations, scene);
  const charRef = useRef<Object3D>(null);
  scene.traverse((child) => {
    if (child instanceof Mesh) {
      child.castShadow = true;
    }
  });

  useEffect(() => {
    useGLTF.preload(path);
  }, [path]);

  useEffect(() => {
    clone.traverse((ch) => {
      if (ch.type === "Mesh") ch.castShadow = true;
    });
  }, [clone]);

  useEffect(() => {
    if (animation) {
      actions[animation]?.reset().fadeIn(0.2).play();
    }
  }, [animation, actions]);

  return (
    <primitive object={scene} position={position} scale={scale} ref={charRef} />
  );
};
export default CharacterCloneModel;
