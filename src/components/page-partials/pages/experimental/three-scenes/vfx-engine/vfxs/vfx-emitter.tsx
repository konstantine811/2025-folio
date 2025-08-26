import { SpawnMode, VFXSettings } from "@/types/three/vfx-particles.model";
import {
  forwardRef,
  JSX,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { Euler, Object3D, Quaternion, Vector3 } from "three";
import { useVFXStore } from "./vfx-store";
import { useFrame } from "@react-three/fiber";
import { randFloat, randInt } from "three/src/math/MathUtils.js";
import VFXBuilderEmitter from "./vfx-builder";

type Props = JSX.IntrinsicElements["object3D"] & {
  settings?: Partial<VFXSettings>;
  emitter: string;
  debug?: boolean;
};

const worldPosition = new Vector3();
const worldQuaternion = new Quaternion();
const worldEuler = new Euler();
const worldRotation = new Euler();
const worldScale = new Vector3();

const VFXEmitter = forwardRef<Object3D, Props>(
  ({ emitter, settings = {}, debug = false, ...props }, forwardedRef) => {
    const [
      {
        duration = 1,
        nbParticles = 1000,
        spawnMode = SpawnMode.time,
        loop = false,
        delay = 0,
        colorStart = ["white", "skyblue"],
        colorEnd = [],
        particlesLifetime = [0.1, 1],
        speed = [5, 20],
        size = [0.1, 1],
        startPositionMin = [-1, -1, -1],
        startPositionMax = [1, 1, 1],
        startRotationMin = [0, 0, 0],
        startRotationMax = [0, 0, 0],
        rotationSpeedMin = [0, 0, 0],
        rotationSpeedMax = [0, 0, 0],
        directionMin = [0, 0, 0],
        directionMax = [0, 0, 0],
      },
      setSettings,
    ] = useState<VFXSettings>(settings as VFXSettings);
    const emitted = useRef(0);
    const elapsedTime = useRef(0);
    const emit = useVFXStore((state) => state.emit);
    const ref = useRef<Object3D>(null);
    useImperativeHandle(forwardedRef, () => ref.current as Object3D);
    useFrame(({ clock }, delta) => {
      if (emitted.current < nbParticles || loop) {
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
          emit(emitter, rate, () => {
            const time = clock.getElapsedTime();
            const object3d = ref.current;
            if (object3d) {
              object3d.updateWorldMatrix(true, true);
              const worldMatrix = object3d.matrixWorld;
              worldMatrix.decompose(worldPosition, worldQuaternion, worldScale);
              worldEuler.setFromQuaternion(worldQuaternion);
              worldRotation.setFromQuaternion(worldQuaternion);
            }
            const randSize = randFloat(size[0], size[1]);
            const color = colorStart[randInt(0, colorStart.length - 1)];
            return {
              position: [
                worldPosition.x +
                  randFloat(startPositionMin[0], startPositionMax[0]),
                worldPosition.y +
                  randFloat(startPositionMin[1], startPositionMax[1]),
                worldPosition.z +
                  randFloat(startPositionMin[2], startPositionMax[2]),
              ],
              direction: [
                randFloat(directionMin[0], directionMax[0]),
                randFloat(directionMin[1], directionMax[1]),
                randFloat(directionMin[2], directionMax[2]),
              ],
              scale: [randSize, randSize, randSize],
              rotation: [
                worldRotation.x +
                  randFloat(startRotationMin[0], startRotationMax[0]),
                worldRotation.y +
                  randFloat(startRotationMin[1], startRotationMax[1]),
                worldRotation.z +
                  randFloat(startRotationMin[2], startRotationMax[2]),
              ],
              rotationSpeed: [
                randFloat(rotationSpeedMin[0], rotationSpeedMax[0]),
                randFloat(rotationSpeedMin[1], rotationSpeedMax[1]),
                randFloat(rotationSpeedMin[2], rotationSpeedMax[2]),
              ],
              lifeTime: [
                time,
                randFloat(particlesLifetime[0], particlesLifetime[1]),
              ],
              colorStart: color,
              colorEnd: colorEnd?.length
                ? colorEnd[randInt(0, colorEnd.length - 1)]
                : color,
              speed: randFloat(speed[0], speed[1]),
            };
          });
          emitted.current += rate;
        }
      }
      elapsedTime.current += delta;
    });

    const onRestart = useCallback(() => {
      emitted.current = 0;
      elapsedTime.current = 0;
    }, []);

    const settingsBuilder = useMemo(
      () =>
        debug ? (
          <VFXBuilderEmitter
            settings={settings as VFXSettings}
            onChange={setSettings}
            onRestart={onRestart}
          />
        ) : null,
      [debug]
    );

    return (
      <>
        {settingsBuilder}
        <object3D {...props} ref={ref}></object3D>
      </>
    );
  }
);

export default VFXEmitter;
