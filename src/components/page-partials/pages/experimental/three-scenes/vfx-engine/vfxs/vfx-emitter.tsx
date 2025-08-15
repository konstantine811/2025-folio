import { SpawnMode, VFXSettings } from "@/types/three/vfx-particles.model";
import { forwardRef, JSX, useImperativeHandle, useRef } from "react";
import { Object3D } from "three";
import { useVFXStore } from "./vfx-store";
import { useFrame } from "@react-three/fiber";

type Props = JSX.IntrinsicElements["object3D"] & {
  settings?: VFXSettings;
  emitter: string;
};

const VFXEmitter = forwardRef<Object3D, Props>(
  ({ emitter, settings = {}, ...props }, forwardedRef) => {
    const {
      duration = 1,
      nbParticles = 1000,
      spawnMode = SpawnMode.time,
      loop = false,
      delay = 0,
    } = settings;
    const emitted = useRef(0);
    const elapsedTime = useRef(0);
    const emit = useVFXStore((state) => state.emit);
    const ref = useRef<Object3D>(null);
    useImperativeHandle(forwardedRef, () => ref.current as Object3D);
    useFrame((_, delta) => {
      if (emitted.current < nbParticles || loop) {
        if (!ref.current) {
          return;
        }
        const particlesToEmit =
          spawnMode === SpawnMode.burst
            ? nbParticles
            : Math.max(
                0,
                Math.floor(
                  ((elapsedTime.current - delay) / duration) * nbParticles
                )
              );
        const rate = particlesToEmit - emitted.current;
        if (rate > 0 && elapsedTime.current >= delay) {
          emit(emitter, { nbParticles: rate });
          emitted.current += rate;
        }
      }
      elapsedTime.current += delta;
    });

    return (
      <>
        <object3D {...props} ref={ref}></object3D>
      </>
    );
  }
);

export default VFXEmitter;
