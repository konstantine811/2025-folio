import { createPortal, useThree } from "@react-three/fiber";
import { Object3D } from "three";
import { RapierHelmetCable } from "./rapier-helment-cable-ropes";

const connectorLocalPositions: [number, number, number][] = [
  [-0.107, 2.159, 6.636],
  [-0.101, 2.145, 6.595],
  [-0.055, 2.163, 6.587],
  [-0.001, 2.165, 6.582],
  [0.059, 2.164, 6.589],
  [0.09, 2.169, 6.605],
  [0.107, 2.163, 6.684],
  [-0.116, 2.138, 6.712],
];

const helmetCenteredOrigin: [number, number, number] = [0, -2.067, -6.745];

type RapierHelmetCablesProps = {
  head?: Object3D;
  helmetPosition: [number, number, number];
  helmetRotation: [number, number, number];
  helmetScale: number;
};

export function RapierHelmetCables({
  head,
  helmetPosition,
  helmetRotation,
  helmetScale,
}: RapierHelmetCablesProps) {
  const { scene } = useThree();

  if (!head) return null;

  return createPortal(
    <>
      {connectorLocalPositions.map((_, index) => (
        <RapierHelmetCable
          key={index}
          head={head}
          connectorLocalPosition={connectorLocalPositions[index]}
          helmetCenteredOrigin={helmetCenteredOrigin}
          helmetPosition={helmetPosition}
          helmetRotation={helmetRotation}
          helmetScale={helmetScale}
          ropeIndex={index}
          ropeCount={connectorLocalPositions.length}
        />
      ))}
    </>,
    scene,
  );
}
