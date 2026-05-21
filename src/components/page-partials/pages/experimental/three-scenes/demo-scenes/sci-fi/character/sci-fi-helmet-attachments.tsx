import { createPortal } from "@react-three/fiber";
import { Object3D } from "three";
import { HelmetCableRopes } from "./cables/helmet-cable-ropes";
import { SholomModel } from "./sholom";

type Vec3 = [number, number, number];

type SciFiHelmetAttachmentsProps = {
  head?: Object3D;
  skeletonRoot?: Object3D;
  bodyProxyCollisionsEnabled?: boolean;
  helmetPosition: Vec3;
  helmetRotation: Vec3;
  helmetScale: number;
};

export function SciFiHelmetAttachments({
  head,
  skeletonRoot,
  bodyProxyCollisionsEnabled = false,
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
      <HelmetCableRopes
        head={head}
        skeletonRoot={skeletonRoot}
        bodyProxyCollisionsEnabled={bodyProxyCollisionsEnabled}
        helmetPosition={helmetPosition}
        helmetRotation={helmetRotation}
        helmetScale={helmetScale}
      />
    </>
  );
}
