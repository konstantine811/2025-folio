import { CameraControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
// import { button, useControls } from "leva";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Mesh } from "three";
import { degToRad } from "three/src/math/MathUtils.js";
import { sections } from "./config";

const CameraController = ({ section }: { section: number }) => {
  const controls = useThree((state) => state.controls as CameraControls);
  const box = useRef<Mesh>(null);
  const sphere = useRef<Mesh>(null);
  const [introFinished, setIntroFinished] = useState(false);
  type SectionKey = (typeof sections)[number];
  const cameraPosition: Record<
    string,
    [number, number, number, number, number, number]
  > = useMemo(
    () => ({
      intro: [0, 0, 3, 0, 0, 0],
      titanium: [0, 0, 3, 0, 0, 0],
      camera: [0, 0, 3, 0, 0, 0],
      "action-button": [0, 0, 3, 0, 0, 0],
    }),
    []
  );

  const playTransition = useCallback(() => {
    const key = sections[section] as SectionKey;
    if (controls) {
      controls.setLookAt(...cameraPosition[key], true);
    }
  }, [cameraPosition, section, controls]);

  const intro = useCallback(async () => {
    if (controls) {
      controls.setLookAt(0, 0, 5, 0, 0, 0, false);
      await controls.dolly(3, true);
      await controls.rotate(degToRad(45), degToRad(25), true);

      setIntroFinished(true);
      playTransition();
    }
  }, [controls, playTransition]);

  useEffect(() => {
    intro();
  }, [intro]);

  useEffect(() => {
    if (!introFinished) {
      return;
    }
    playTransition();
  }, [playTransition, introFinished]);

  //   useControls("dolly", {
  //     in: button(() => {
  //       if (controls) {
  //         controls.dolly(1, true);
  //       }
  //     }),
  //     out: button(() => {
  //       if (controls) {
  //         controls.dolly(-1, true);
  //       }
  //     }),
  //   });

  //   useControls("truck", {
  //     up: button(() => {
  //       if (controls) {
  //         controls.truck(0, -0.5, true);
  //       }
  //     }),
  //     left: button(() => {
  //       if (controls) {
  //         controls.truck(-0.5, 0, true);
  //       }
  //     }),
  //     down: button(() => {
  //       if (controls) {
  //         controls.truck(0, 0.5, true);
  //       }
  //     }),
  //     right: button(() => {
  //       if (controls) {
  //         controls.truck(0.5, 0, true);
  //       }
  //     }),
  //   });

  //   useControls("rotate", {
  //     up: button(() => {
  //       if (controls) {
  //         controls.rotate(0, -0.5, true);
  //       }
  //     }),
  //     left: button(() => {
  //       if (controls) {
  //         controls.rotate(-0.5, 0, true);
  //       }
  //     }),
  //     down: button(() => {
  //       if (controls) {
  //         controls.rotate(0, 0.5, true);
  //       }
  //     }),
  //     right: button(() => {
  //       if (controls) {
  //         controls.rotate(0.5, 0, true);
  //       }
  //     }),
  //   });

  //   useControls("settings", {
  //     smoothTime: {
  //       value: 0.35,
  //       min: 0.1,
  //       max: 2,
  //       step: 0.1,
  //       onChange: (value) => {
  //         if (controls) {
  //           controls.smoothTime = value;
  //         }
  //       },
  //     },
  //   });

  //   useControls("fit", {
  //     fitToBox: button(() => {
  //       if (controls && box.current) {
  //         controls.fitToBox(box.current, true);
  //       }
  //     }),
  //     fitToSphere: button(() => {
  //       if (controls && sphere.current) {
  //         controls.fitToSphere(sphere.current, true);
  //       }
  //     }),
  //   });

  return (
    <>
      <mesh ref={box} visible={false}>
        <boxGeometry args={[0.5, 1, 0.2]} />
        <meshBasicMaterial color="mediumpurple" wireframe />
      </mesh>
      <mesh ref={sphere} visible={false}>
        <sphereGeometry args={[0.3, 64]} />
        <meshBasicMaterial color="hotpink" wireframe />
      </mesh>
    </>
  );
};

export default CameraController;
