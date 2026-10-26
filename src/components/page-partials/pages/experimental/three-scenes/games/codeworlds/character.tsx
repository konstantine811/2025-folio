import { useAnimations, useGLTF } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import { Box3, Group, LoopOnce, LoopRepeat, Mesh, Vector3 } from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";

// Exports contain earlier animations too, so select each clip explicitly.
const CODEWORLDS_ASSETS = {
  model: "/3d-models/codeworlds/walk_man.glb",
  idle: "/3d-models/codeworlds/idle.glb",
  run: "/3d-models/codeworlds/run.glb",
  jump: "/3d-models/codeworlds/jump.glb",
  falling: "/3d-models/codeworlds/jump_falling.glb",
  runClip: "Root.002|mixamo.com|Layer0",
  jumpClip: "Root.003|mixamo.com|Layer0.001",
  fallingClip: "Root.004|mixamo.com|Layer0",
  walkClip: "Root|mixamo.com|Layer0",
  idleClip: "Root.001|mixamo.com|Layer0",
} as const;

export function CodeworldsCharacter({ isMoving, isSprinting, isGrounded, verticalVelocity }: {
  isMoving: boolean;
  isSprinting: boolean;
  isGrounded: boolean;
  verticalVelocity: number;
}) {
  const model = useGLTF(CODEWORLDS_ASSETS.model);
  const idle = useGLTF(CODEWORLDS_ASSETS.idle);
  const run = useGLTF(CODEWORLDS_ASSETS.run);
  const jump = useGLTF(CODEWORLDS_ASSETS.jump);
  const falling = useGLTF(CODEWORLDS_ASSETS.falling);
  const ref = useRef<Group>(null);
  const { scene, scale, offset } = useMemo(() => {
    const scene = clone(model.scene);
    scene.traverse((object) => {
      if (object instanceof Mesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });
    const bounds = new Box3().setFromObject(scene);
    const scale = 2.4 / bounds.getSize(new Vector3()).y;
    return { scene, scale, offset: -bounds.min.y * scale };
  }, [model.scene]);
  const clips = useMemo(() => [
    { source: model.animations, name: CODEWORLDS_ASSETS.walkClip, alias: "walk" },
    { source: idle.animations, name: CODEWORLDS_ASSETS.idleClip, alias: "idle" },
    { source: run.animations, name: CODEWORLDS_ASSETS.runClip, alias: "run" },
    { source: jump.animations, name: CODEWORLDS_ASSETS.jumpClip, alias: "jump" },
    { source: falling.animations, name: CODEWORLDS_ASSETS.fallingClip, alias: "falling" },
  ].map(({ source, name, alias }) => {
    const clip = source.find((animation) => animation.name === name);
    if (!clip) throw new Error(`Codeworlds: missing animation ${name}`);
    const copy = clip.clone();
    copy.name = alias;
    // GLTFLoader sanitizes Blender's Root.001 → Root001, etc.
    // Every clip must animate the original walk_man armature named Root.
    for (const track of copy.tracks) {
      track.name = track.name.replace(/^Root\d+\./, "Root.");
    }
    return copy;
  }), [model.animations, idle.animations, run.animations, jump.animations, falling.animations]);
  const { actions } = useAnimations(clips, ref);

  // Ground rays still reach the floor during the first frames of takeoff.
  const animation = verticalVelocity > 0.2
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
