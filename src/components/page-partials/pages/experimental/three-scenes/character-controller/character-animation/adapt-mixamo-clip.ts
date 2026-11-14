import { AnimationClip, Object3D, Quaternion, Vector3 } from "three";

function boneKey(name: string) {
  return name.replace(/^mixamorig[:_]?/i, "").toLowerCase();
}

type MixamoAnimationSource = Object3D & { animations: AnimationClip[] };

export type AdaptMixamoClipOptions = {
  /** Loaded FBX containing a compatible Mixamo skeleton and animation. */
  source: MixamoAnimationSource;
  /** Loaded character GLB in its original bind pose (before playback). */
  target: Object3D;
  /** Output action name, e.g. "walk", "run", "jump" or "falling". */
  name: string;
  /** Required when the source contains multiple animations. */
  clipName?: string;
  /** Source bone units → target bone units; default 1 for Blender/Mixamo exports. */
  translationScale?: number;
};

/**
 * Adapt a compatible Mixamo FBX clip for a character GLB without mutating
 * cached clips. Correct the pelvis' parent orientation, retain its vertical
 * motion and remove horizontal root motion so physics owns world movement.
 * This does not retarget arbitrary rigs or compensate for different bone axes.
 *
 * useMemo(() => adaptMixamoClip({ source: walkFBX, target: model.scene, name: "walk" }), [walkFBX, model.scene])
 */
export function adaptMixamoClip({ source, target, name, clipName, translationScale = 1 }: AdaptMixamoClipOptions): AnimationClip {
  const clip = clipName
    ? source.animations.find(animation => animation.name === clipName)
    : source.animations.length === 1 ? source.animations[0] : undefined;
  if (!clip) {
    throw new Error(`Mixamo: select an existing animation for "${name}" (available: ${source.animations.map(animation => animation.name).join(", ") || "none"})`);
  }

  const targetBones = new Map<string, Object3D>();
  target.traverse(node => targetBones.set(boneKey(node.name), node));
  let sourceHips: Object3D | undefined;
  source.traverse(node => { if (boneKey(node.name) === "hips") sourceHips = node; });
  const targetHips = targetBones.get("hips");
  if (!sourceHips || !targetHips) throw new Error(`Mixamo: "${name}" requires Hips on both skeletons`);

  const sourceHipsHeight = sourceHips.position.y;
  target.updateMatrixWorld(true);
  source.updateMatrixWorld(true);
  const targetParent = targetHips.parent?.getWorldQuaternion(new Quaternion()) ?? new Quaternion();
  const sourceParent = sourceHips.parent?.getWorldQuaternion(new Quaternion()) ?? new Quaternion();
  const correction = targetParent.invert().multiply(sourceParent);
  const result = clip.clone();
  result.name = name;
  const displacement = new Vector3();
  const rotation = new Quaternion();

  result.tracks = result.tracks.filter(track => {
    const dot = track.name.lastIndexOf(".");
    const key = boneKey(track.name.slice(0, dot));
    const property = track.name.slice(dot + 1);
    // Keep bind-pose translations and scales on all other bones.
    if (property !== "quaternion" && !(key === "hips" && property === "position")) return false;
    const targetBone = targetBones.get(key);
    if (!targetBone) throw new Error(`Mixamo: missing target bone "${key}" for "${name}"`);
    track.name = `${targetBone.name}.${property}`;
    if (key === "hips" && property === "position") {
      for (let i = 0; i < track.values.length; i += 3) {
        displacement.set(0, (track.values[i + 1] - sourceHipsHeight) * translationScale, 0)
          .applyQuaternion(correction).add(targetHips.position).toArray(track.values, i);
      }
    } else if (key === "hips" && property === "quaternion") {
      for (let i = 0; i < track.values.length; i += 4) {
        rotation.fromArray(track.values, i).premultiply(correction).toArray(track.values, i);
      }
    }
    return true;
  });
  return result;
}
