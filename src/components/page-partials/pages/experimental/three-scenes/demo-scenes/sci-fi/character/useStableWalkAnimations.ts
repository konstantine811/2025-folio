import { useMemo } from "react";
import { AnimationClip } from "three";

type UseStableWalkAnimationsParams = {
  animations: AnimationClip[];
  walkAnimationNames: string[];
  stableBoneTracks: string[];
};

function normalizeTrackBoneName(trackName: string) {
  return trackName
    .split(".")[0]
    .replace(/[^a-z0-9]/gi, "")
    .toLowerCase();
}

/** Only mixamorig bones are mounted in the R3F scene graph. */
function isMixamorigTrack(trackName: string) {
  return normalizeTrackBoneName(trackName).startsWith("mixamorig");
}

export function useStableWalkAnimations({
  animations,
  walkAnimationNames,
  stableBoneTracks,
}: UseStableWalkAnimationsParams) {
  return useMemo(() => {
    return animations.map((clip) => {
      const stabilizeWalkHead = walkAnimationNames.includes(clip.name);
      const hasNonMixamorigTracks = clip.tracks.some(
        ({ name }) => !isMixamorigTrack(name),
      );

      if (!stabilizeWalkHead && !hasNonMixamorigTracks) {
        return clip;
      }

      const sanitizedClip = clip.clone();

      sanitizedClip.tracks = sanitizedClip.tracks.filter(({ name }) => {
        if (!isMixamorigTrack(name)) {
          return false;
        }

        if (!stabilizeWalkHead) {
          return true;
        }

        const normalizedTrackName = normalizeTrackBoneName(name);

        return !stableBoneTracks.some((boneName) =>
          normalizedTrackName.includes(boneName),
        );
      });

      return sanitizedClip;
    });
  }, [animations, walkAnimationNames, stableBoneTracks]);
}
