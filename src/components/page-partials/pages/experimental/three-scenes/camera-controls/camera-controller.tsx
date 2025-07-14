import { CameraControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { button, useControls } from "leva";

const CameraController = () => {
  const controls = useThree((state) => state.controls as CameraControls);
  useControls("dolly", {
    in: button(() => {
      if (controls) {
        controls.dolly(1, true);
      }
    }),
    out: button(() => {
      if (controls) {
        controls.dolly(-1, true);
      }
    }),
  });

  useControls("truck", {
    up: button(() => {
      if (controls) {
        controls.truck(0, -0.5, true);
      }
    }),
    left: button(() => {
      if (controls) {
        controls.truck(-0.5, 0, true);
      }
    }),
    down: button(() => {
      if (controls) {
        controls.truck(0, 0.5, true);
      }
    }),
    right: button(() => {
      if (controls) {
        controls.truck(0.5, 0, true);
      }
    }),
  });

  useControls("rotate", {
    up: button(() => {
      if (controls) {
        controls.rotate(0, -0.5, true);
      }
    }),
    left: button(() => {
      if (controls) {
        controls.rotate(-0.5, 0, true);
      }
    }),
    down: button(() => {
      if (controls) {
        controls.rotate(0, 0.5, true);
      }
    }),
    right: button(() => {
      if (controls) {
        controls.rotate(0.5, 0, true);
      }
    }),
  });

  useControls("settings", {
    smoothTime: {
      value: 0.35,
      min: 0.1,
      max: 2,
      step: 0.1,
      onChange: (value) => {
        if (controls) {
          controls.smoothTime = value;
        }
      },
    },
  });

  return null;
};

export default CameraController;
