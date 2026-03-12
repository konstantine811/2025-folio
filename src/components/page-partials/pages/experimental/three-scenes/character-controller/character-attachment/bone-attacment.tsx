import {
  useEffect,
  useRef,
  forwardRef,
  ReactNode,
  useImperativeHandle,
} from "react";
import { Bone, Group, Object3D } from "three";

type BoneAttachmentProps = {
  parentScene: Object3D;
  boneName: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  children: ReactNode;
};

function findBone(root: Object3D, name: string): Bone | null {
  let result: Bone | null = null;
  root.traverse((child) => {
    if ((child as Bone).isBone && child.name === name) {
      result = child as Bone;
    }
  });
  return result;
}

export const BoneAttachment = forwardRef<Group, BoneAttachmentProps>(
  (
    {
      parentScene,
      boneName,
      position = [0, 0, 0],
      rotation = [0, 0, 0],
      scale = [1, 1, 1],
      children,
    },
    ref,
  ) => {
    const groupRef = useRef<Group>(null);

    useImperativeHandle(ref, () => groupRef.current!, []);

    useEffect(() => {
      const group = groupRef.current;
      if (!group) return;

      const bone = findBone(parentScene, boneName);
      if (!bone) {
        console.warn(`Bone "${boneName}" not found in scene`);
        return;
      }

      bone.add(group);
      group.position.set(...position);
      group.rotation.set(...rotation);
      group.scale.set(...scale);

      return () => {
        bone.remove(group);
      };
    }, [parentScene, boneName, position, rotation, scale]);

    return <group ref={groupRef}>{children}</group>;
  },
);
