import { createPortal } from "@react-three/fiber";
import { Object3D } from "three";
import { HelmetCableRopes } from "./helmet-cable-ropes";
import { SholomModel } from "./sholom";

type Vec3 = [number, number, number];

type SciFiHelmetAttachmentsProps = {
  head?: Object3D;

  helmetPosition: Vec3;
  helmetRotation: Vec3;
  helmetScale: number;
};

export function SciFiHelmetAttachments({
  head,
  helmetPosition,
  helmetRotation,
  helmetScale,
}: SciFiHelmetAttachmentsProps) {
  if (!head) return null;

  return (
    <>
      {createPortal(
        <SholomModel
          centered
          position={helmetPosition}
          rotation={helmetRotation}
          scale={helmetScale}
        />,
        head,
      )}

      <HelmetCableRopes
        head={head}
        helmetPosition={helmetPosition}
        helmetRotation={helmetRotation}
        helmetScale={helmetScale}
      />
    </>
  );
}
