import { CameraControls } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
// 2️⃣ Це клас з ACTION
import CameraControlsImpl from "camera-controls";
import { usePauseStore } from "../store/usePauseMode";
import { useFrame } from "@react-three/fiber";
import { CatmullRomCurve3, Vector3 } from "three";
import { useEditModeStore } from "../store/useEditModeStore";
import { useScrollStore } from "../store/useScrollStore";
import { useGameDataStore } from "../physic-world/character-controller/stores/game-data-store";

const FlyCameraControl = ({
  active,
  scrolledControl,
}: {
  active: boolean;
  scrolledControl: boolean;
}) => {
  const cameraControlRef = useRef<CameraControls | null>(null!);
  const isGameStarted = usePauseStore((s) => s.isGameStarted);
  const setCameraControls = useEditModeStore((s) => s.setCameraControls);
  const scrollProgress = useScrollStore((s) => s.progress);
  const characterRb = useGameDataStore((s) => s.characterRigidBody);

  const curve = useMemo(
    () =>
      new CatmullRomCurve3(
        [
          new Vector3(43.978436079080794, 4.0, 12.918685681365263),
          new Vector3(43.98302318018171, 3.9, 9.14471941887912),
          new Vector3(43.1926380933868, 1.76944670456502, 9.275273014217724),
          new Vector3(45.35873778869439, 3.64715431336889, 13.7),
          // THREE.JS VIEW
          new Vector3(43.9, 3.73, 13.7),
          // BACKEND VIEW
          new Vector3(41.4, 3.73, 13.7),
          // D3.jS And AGGRID
          new Vector3(40.8, 3.73, 13.7),
          // FRONTEND VIEW
          new Vector3(41.1720657571576, 3.3570588529308814, 13.7),
          // UI VIEW
          new Vector3(
            41.092634545966725,
            3.567348628900795,
            11.121839349871227
          ),
          // MAP VIEW
          new Vector3(41.69800317660778, 2.471740146661359, 9.795929492537473),
          // SKILLS KERNEL
          new Vector3(43.2170394538659, 2.774911775262469, 13.384355785869218),
          // SKILLS UDREAM
          new Vector3(40.92712966058979, 2.700110320085005, 12.136252328576775),
          // PC TABLE
          new Vector3(42.03928459576235, 2.521374500558587, 13.601128525923627),
          // OUT FROM HOUSE
          new Vector3(
            35.651801751137924,
            2.4520953635140033,
            15.378050768739776
          ),
          // ROBOT
          new Vector3(
            7.731501229186418,
            4.7033521324016965,
            26.304599860269533
          ),
          // BACK TO ROBOT
          new Vector3(
            -20.99048715362204,
            10.898631112409976,
            2.9740640077417027
          ),
          // TOP VIEW
          new Vector3(
            -22.121187610709768,
            43.100929254805344,
            -12.312393638987665
          ),
        ],
        false,
        "catmullrom",
        0.5
      ),
    []
  );
  // 45.25110153087106, y: 1.9843068863214892, z: 32.346953168643104
  const curveLookAt = useMemo(
    () =>
      new CatmullRomCurve3(
        [
          new Vector3(
            43.978436079080794,
            0.341350839410774,
            12.918685681365263
          ),
          new Vector3(43.98301278294349, 0.341351497954179, 5.1447212484257),
          new Vector3(40.0, 3.3, 15),
          new Vector3(43.4, 5, 22),
          // THREE.JS VIEW
          new Vector3(36, 5, 22),
          // BACKEND VIEW
          new Vector3(39.5, 5, 22),
          // D3.jS And AGGRID
          new Vector3(
            1.6009517888783733,
            6.416391147632353,
            11.544584430329929
          ),
          // FRONTEND VIEW
          new Vector3(1.8955474334490259, 6.267033082066517, 14.9915171996511),
          // UI VIEW
          new Vector3(1.8161162222581522, 6.47732285803643, 13.165684764170653),
          // MAP VIEW
          new Vector3(
            1.6592314828677615,
            2.8675252421598936,
            8.995927140731348
          ),
          // SKILLS KERNEL
          new Vector3(40.10913854275295, -0.5658603731354424, 45.852989264911),
          // SKILLS UDREAM
          new Vector3(
            10.42701407608588,
            -1.6646544375910326,
            11.038658377826886
          ),
          // PC TABLE
          new Vector3(
            10.424155358981658,
            -2.002955957132634,
            12.463409080030884
          ),
          // OUT FROM HOUSE
          new Vector3(
            10.616537392664284,
            -0.3778790527251633,
            9.992383130216131
          ),
          // ROBOT
          new Vector3(
            3.749373802967759,
            3.3408589648622655,
            12.423690950063504
          ),
          // BACK TO ROBOT
          new Vector3(
            3.749373802967759,
            3.3408589648622655,
            12.423690950063504
          ),
          // TOP VIEW
          new Vector3(
            8.638626289289517,
            3.8185912321978557,
            1.4548648405900755
          ),
        ],
        false,
        "catmullrom",
        0.5
      ),
    []
  );
  const pos = useMemo(() => new Vector3(), []);
  const look = useMemo(() => new Vector3(), []);
  useEffect(() => {
    const controls = cameraControlRef.current;
    if (!controls) return;
    setCameraControls(controls);
    if (!isGameStarted) {
      controls.setPosition(
        curve.points[0].x,
        curve.points[0].y,
        curve.points[0].z
      );
      controls.setTarget(
        curveLookAt.points[0].x,
        curveLookAt.points[0].y,
        curveLookAt.points[0].z
      );
    }
    controls.mouseButtons.left = CameraControlsImpl.ACTION.NONE;
    controls.mouseButtons.middle = CameraControlsImpl.ACTION.DOLLY;
    controls.mouseButtons.right = CameraControlsImpl.ACTION.NONE;
    controls.mouseButtons.wheel = CameraControlsImpl.ACTION.ROTATE;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Meta") {
        controls.mouseButtons.wheel = CameraControlsImpl.ACTION.DOLLY;
      }
      if (e.key === "Shift") {
        controls.mouseButtons.wheel = CameraControlsImpl.ACTION.TRUCK;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Meta" || e.key === "Shift") {
        controls.mouseButtons.wheel = CameraControlsImpl.ACTION.ROTATE;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [setCameraControls, isGameStarted, curveLookAt, curve]);

  useEffect(() => {
    const controls = cameraControlRef.current;
    if (!controls) return;
    if (active && characterRb) {
      const { x, y, z } = characterRb.translation();
      controls.setPosition(x + 2, y + 2, z + 2);
    }
  }, [active, characterRb]);

  useFrame(() => {
    if (!scrolledControl) return;
    if (!isGameStarted && cameraControlRef.current) {
      const controls = cameraControlRef.current;
      // scroll.offset: 0..1 — позиція скролу
      curve.getPoint(scrollProgress, pos);
      curveLookAt.getPoint(scrollProgress, look);
      controls.setPosition(pos.x, pos.y, pos.z, true);
      controls.setLookAt(pos.x, pos.y, pos.z, look.x, look.y, look.z, true);
      // controls.setTarget(look.x, look.y, look.z, true);
      // controls.setLookAt(look.x, look.y, look.z, true);
      // controls.lookAt(look);
    }
  });

  return (
    <CameraControls
      ref={cameraControlRef}
      makeDefault
      enabled={active && isGameStarted}
      azimuthRotateSpeed={1}
      polarRotateSpeed={1}
      truckSpeed={1}
    />
  );
};

export default FlyCameraControl;
