import { useAnimations } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import { AnimationClip, Box3, Group, LoopOnce, LoopRepeat, Mesh, Object3D, SkinnedMesh, Vector3 } from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";

export type LocomotionState = {
  isMoving: boolean;
  isSprinting: boolean;
  isGrounded: boolean;
  isJumpPreparing: boolean;
  isMovingJump: boolean;
  verticalVelocity: number;
};

export function AnimatedLocomotionCharacter({ sourceScene, clips, isMoving, isSprinting, isGrounded, isJumpPreparing, isMovingJump, verticalVelocity }: LocomotionState & { sourceScene: Object3D; clips: AnimationClip[] }) {
  const ref = useRef<Group>(null);
  const { scene, scale, offset } = useMemo(() => {
    const scene = clone(sourceScene);
    scene.traverse((object) => {
      if (object instanceof Mesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });
    // SkeletonUtils clones need fresh bone matrices before measuring their skin.
    scene.updateMatrixWorld(true);
    scene.traverse(object => {
      if (object instanceof SkinnedMesh) {
        object.skeleton.update();
        object.computeBoundingBox();
      }
    });
    const bounds = new Box3().setFromObject(scene);
    const scale = 2.4 / bounds.getSize(new Vector3()).y;
    return { scene, scale, offset: -bounds.min.y * scale };
  }, [sourceScene]);
  const { actions } = useAnimations(clips, ref);

  // Ground rays still reach the floor during the first frames of takeoff.
  const animation = isMovingJump && !isGrounded
    ? "falling"
    : isJumpPreparing || verticalVelocity > 0.2
      ? "jump"
      : !isGrounded
        ? "falling"
        : isMoving
          ? isSprinting ? "run" : "walk"
          : "idle";

  useEffect(() => {
    const action = actions[animation];
    if (!action) return;
    action.reset();
    action.setLoop(animation === "jump" ? LoopOnce : LoopRepeat, Infinity);
    action.clampWhenFinished = animation === "jump";
    action.setEffectiveTimeScale(1).setEffectiveWeight(1).fadeIn(0.15).play();
    return () => { action.fadeOut(0.15); };
  }, [actions, animation]);

  return <group ref={ref} position={[0, offset, 0]} scale={scale}>
    <primitive object={scene} />
  </group>;
}
