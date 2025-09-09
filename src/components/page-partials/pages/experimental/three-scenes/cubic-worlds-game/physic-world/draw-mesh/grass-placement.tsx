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
import { useGeometry } from "../../utils/getModelGeometry";
import { useEmbeddedMaps } from "../../utils/textureAlbedoHandle";
import { useFrame } from "@react-three/fiber";

export type GrassPlacement = {
  center: Vector3;
  rotation: Quaternion; // Y->normal (або твій qFinal з Y->Z->normal)
  diameter: number;
};

type GrassFieldProps = {
  placements: GrassPlacement[]; // 1000 штук тут
  modelUrl: string;
  meshName?: string;
  materialProps?: Partial<JSX.IntrinsicElements["winderMaterial"]>;
};

export function GrassField({
  placements,
  modelUrl,
  meshName,
  materialProps,
}: GrassFieldProps) {
  const meshRef = useRef<InstancedMesh>(null!);
  const matRef = useRef<ShaderMaterial>(null!);
  const dummy = useMemo(() => new Object3D(), []);
  const blade = useGeometry(modelUrl, meshName); // має aTip
  const { albedo } = useEmbeddedMaps(modelUrl, meshName);
  const COUNT = placements.length;

  // оновлюємо time ОДИН раз
  useFrame((_, dt) => {
    if (matRef.current) matRef.current.uniforms.time.value += dt;
  });

  useLayoutEffect(() => {
    if (!meshRef.current) return;
    console.log("update placement", COUNT);
    // інстанс-атрибути
    const aBend = new Float32Array(COUNT);
    const aPhase = new Float32Array(COUNT); // додатковий атрибут фази

    for (let i = 0; i < COUNT; i++) {
      const p = placements[i];

      // масштаб від діаметра (підлаштуй коефіцієнти)
      const sx = Math.max(1e-4, p.diameter);
      const sy = Math.max(1e-4, p.diameter);
      const sz = sx;

      const qYtoZ = new Quaternion().setFromAxisAngle(
        new Vector3(1, 0, 0),
        Math.PI / 2
      );
      // спочатку застосуємо Y->Z до леза, потім Z->normal (твій rotation)
      const qFinal = p.rotation.clone().multiply(qYtoZ);

      dummy.position.copy(p.center);
      dummy.quaternion.copy(qFinal);
      dummy.scale.set(sx, sy, sz);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);

      aBend[i] = 0.8 + (0.2 * ((i * 16807) % 1000)) / 1000; // простий псевдорандом
      aPhase[i] = ((i * 48271) % 1000) / 1000; // 0..1
    }

    const geom = meshRef.current.geometry as BufferGeometry;
    geom.setAttribute("aBend", new InstancedBufferAttribute(aBend, 1));
    geom.setAttribute("aPhase", new InstancedBufferAttribute(aPhase, 1));
    geom.computeBoundingSphere(); // або frustumCulled=false

    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [placements, dummy, COUNT]);

  return (
    <instancedMesh ref={meshRef} args={[blade, undefined, COUNT]} receiveShadow>
      <winderMaterial
        ref={matRef}
        defines={{ USE_INSTANCING: "" }}
        // рендер
        frustumCulled={true}
        transparent={false}
        // side={THREE.DoubleSide} // якщо потрібна задня сторона
        // alphaTest={0.5}        // якщо використовуєш маску країв (краще за transparent)
        // текстури / вітер
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
