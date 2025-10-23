// useFootprintFromPlayer.ts
import { useFrame } from "@react-three/fiber";
import { Vector2, Vector3 } from "three";
import { RapierRigidBody } from "@react-three/rapier";

type Bounds = { min: Vector2; max: Vector2 }; // по XZ в світі

export function useFootprintFromPlayer(opts: {
  boundsXZ: Bounds; // межі карти у світових координатах XZ
  addTouch: (p: { x: number; y: number }) => void; // з useTouchTexture
  brushStep?: number; // м'який даунсемпл: як часто малювати
  characterRigidBody: RapierRigidBody | null | undefined;
  onGround: boolean;
}) {
  const last = new Vector3();
  const tmp = new Vector3();
  const { characterRigidBody, onGround } = opts;
  const size = opts.boundsXZ.max.clone().sub(opts.boundsXZ.min);
  const toUV = (x: number, z: number) => ({
    x: (x - opts.boundsXZ.min.x) / size.x,
    y: (z - opts.boundsXZ.min.y) / size.y,
  });

  useFrame(() => {
    if (!characterRigidBody) return;
    if (!onGround) return;
    tmp.copy(characterRigidBody.translation());
    if (!tmp.equals(last)) {
      // нормалізовані UV на базі XZ
      const uv = toUV(tmp.x, tmp.z);
      // захист від виходу за межі
      if (uv.x >= 0 && uv.x <= 1 && uv.y >= 0 && uv.y <= 1) {
        opts.addTouch(uv);
      }
      last.copy(tmp);
    }
  });
}
