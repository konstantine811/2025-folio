import { createPortal } from "@react-three/fiber";
import { Object3D } from "three";
import { RapierHelmetCables } from "./cables/rapier-helmet-cables";
import { SholomModel } from "./sholom";
import SimpleHelmetCable from "./cables/simple-halmet-cable";

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
        <>
          <SholomModel
            centered
            position={helmetPosition}
            rotation={helmetRotation}
            scale={helmetScale}
          />
        </>,
        head,
      )}
      <RapierHelmetCables
        head={head}
        helmetPosition={helmetPosition}
        helmetRotation={helmetRotation}
        helmetScale={helmetScale}
      />
      {/* <SimpleHelmetCable
        head={head}
        helmetPosition={helmetPosition}
        helmetRotation={helmetRotation}
        helmetScale={helmetScale}
      /> */}
    </>
  );
}
