import { JSX, useLayoutEffect, useMemo, useRef } from "react";
import {
  BufferGeometry,
  InstancedBufferAttribute,
  InstancedMesh,
  Object3D,
  Quaternion,
  ShaderMaterial,
  Vector2,
  Vector3,
} from "three";
import { useGeometry } from "../../utils/getModelGeometry.ts";
import { useEmbeddedMaps } from "../../utils/textureAlbedoHandle.ts";
import { useFrame } from "@react-three/fiber";

type GrassSingleProps = {
  diameter: number; // беремо радіус із geometry
  center: Vector3; // з DrawMesh
  rotation: Quaternion; // з DrawMesh (орієнтація під нормаль)
  modelUrl: string;
  meshName?: string;
  materialProps?: Partial<JSX.IntrinsicElements["grassGradientMaterial"]>;
};

export function GrassSingle({
  diameter,
  center,
  rotation,
  modelUrl,
  meshName,
  materialProps,
}: GrassSingleProps) {
  const meshRef = useRef<InstancedMesh>(null!);
  const dummy = useMemo(() => new Object3D(), []);
  const blade = useGeometry(modelUrl, meshName);
  const grassMaterialRef = useRef<ShaderMaterial>(null!);
  const { albedo } = useEmbeddedMaps(modelUrl, meshName);
  // фіксовані внутрішні коефіцієнти масштабу від діаметра
  useLayoutEffect(() => {
    if (!meshRef.current) return;

    // масштаб від діаметра круга
    const sx = Math.max(1e-4, diameter);
    const sy = Math.max(1e-4, diameter);
    const sz = sx; // товщина по Z така ж, як по X (за потреби змінюй)
    // ✅ коректор: Y -> Z (90° навколо X)

    const qYtoZ = new Quaternion().setFromAxisAngle(
      new Vector3(1, 0, 0),
      Math.PI / 2
    );
    // спочатку застосуємо Y->Z до леза, потім Z->normal (твій rotation)
    const qFinal = rotation.clone().multiply(qYtoZ);
    // позиція/орієнтація: беремо з DrawMesh; без додаткового yaw
    dummy.position.copy(center);
    dummy.quaternion.copy(qFinal);
    dummy.scale.set(sx, sy, sz);
    dummy.updateMatrix();
    meshRef.current.setMatrixAt(0, dummy.matrix);

    // aBend = 1 для одного інстансу
    const aBend = new Float32Array(1);
    aBend[0] = 1.0;
    (meshRef.current.geometry as BufferGeometry).setAttribute(
      "aBend",
      new InstancedBufferAttribute(aBend, 1)
    );

    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [diameter, center, rotation, dummy]);

  useFrame((_, dt) => {
    if (!grassMaterialRef.current) return;
    grassMaterialRef.current.uniforms.time.value += dt;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[blade, undefined, 1]}
      receiveShadow
      frustumCulled={false}
    >
      <grassGradientMaterial
        ref={grassMaterialRef}
        transparent
        depthWrite
        defines={{ USE_INSTANCING: "" }}
        albedoMap={albedo ?? null}
        edgeMaskMap={null}
        useEdgeMask={0}
        uWindAmp={0.06}
        uWindFreq={1.2}
        uWindDir={new Vector2(0.85, 0.2).normalize()}
        transparency={0.0}
        {...materialProps}
      />
    </instancedMesh>
  );
}
