import { useMemo } from "react";
import { AnimationClip } from "three";

type UseStableWalkAnimationsParams = {
  animations: AnimationClip[];
  walkAnimationName: string;
  stableBoneTracks: string[];
};

export function useStableWalkAnimations({
  animations,
  walkAnimationName,
  stableBoneTracks,
}: UseStableWalkAnimationsParams) {
  return useMemo(() => {
    return animations.map((clip) => {
      if (clip.name !== walkAnimationName) {
        return clip;
      }

      const stableWalkClip = clip.clone();

      stableWalkClip.tracks = stableWalkClip.tracks.filter(({ name }) => {
        const normalizedTrackName = name
          .replace(/[^a-z0-9]/gi, "")
          .toLowerCase();

        return !stableBoneTracks.some((boneName) =>
          normalizedTrackName.includes(boneName),
        );
      });

      return stableWalkClip;
    });
  }, [animations, walkAnimationName, stableBoneTracks]);
}
