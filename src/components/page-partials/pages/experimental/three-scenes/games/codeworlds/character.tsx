import { useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import { AnimatedLocomotionCharacter } from "../../character-controller/character-animation/animated-locomotion-character";

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

export function CodeworldsCharacter({ isMoving, isSprinting, isGrounded, isJumpPreparing, isMovingJump, verticalVelocity }: {
  isMoving: boolean;
  isSprinting: boolean;
  isGrounded: boolean;
  isJumpPreparing: boolean;
  isMovingJump: boolean;
  verticalVelocity: number;
}) {
  const model = useGLTF(CODEWORLDS_ASSETS.model);
  const idle = useGLTF(CODEWORLDS_ASSETS.idle);
  const run = useGLTF(CODEWORLDS_ASSETS.run);
  const jump = useGLTF(CODEWORLDS_ASSETS.jump);
  const falling = useGLTF(CODEWORLDS_ASSETS.falling);
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
  return <AnimatedLocomotionCharacter sourceScene={model.scene} clips={clips}
    isMoving={isMoving} isSprinting={isSprinting} isGrounded={isGrounded}
    isJumpPreparing={isJumpPreparing} isMovingJump={isMovingJump} verticalVelocity={verticalVelocity} />;
}
