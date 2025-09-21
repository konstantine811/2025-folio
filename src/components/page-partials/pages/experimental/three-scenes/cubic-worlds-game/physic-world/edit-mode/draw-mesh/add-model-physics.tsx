import { useMemo, useRef } from "react";
import {
  BufferGeometry,
  InstancedMesh,
  Material,
  Matrix4,
  NormalBufferAttributes,
  ShaderMaterial,
  Vector3,
  Quaternion,
} from "three";
import { InstancedRigidBodies } from "@react-three/rapier";
import useCreateInstancedMesh from "./hooks/useCreateInstancedMesh";
import { PhysicsData } from "../../../store/useEditModeStore";

type Props = {
  matrices: Matrix4[];
  material: ShaderMaterial | Material;
  blade: BufferGeometry<NormalBufferAttributes>;
  onMatrixUpdate?: (index: number) => void;
  onAddGeometryData?: (geom: BufferGeometry<NormalBufferAttributes>) => void;
  physicsData: PhysicsData;
};

const AddModelPhysics = ({
  matrices,
  material,
  blade,
  onAddGeometryData,
  onMatrixUpdate,
  physicsData,
}: Props) => {
  const meshRef = useRef<InstancedMesh>(null!);
  const { geometry, COUNT } = useCreateInstancedMesh({
    matrices,
    blade,
    meshRef,
    onAddGeometryData,
    onMatrixUpdate,
    isFrustumCulled: physicsData.type === "fixed" ? true : false,
  });

  // Перетворюємо матриці на props для фізики
  const instances = useMemo(() => {
    const p = new Vector3();
    const q = new Quaternion();
    const s = new Vector3();
    return matrices.map((m, i) => {
      m.decompose(p, q, s);
      return {
        key: `rb_${i}`,
        position: [p.x, p.y, p.z] as [number, number, number],
        // Можна передати або Euler rotation, або quaternion.
        // quaternion стабільніший:
        quaternion: [q.x, q.y, q.z, q.w] as [number, number, number, number],
        scale: [s.x, s.y, s.z] as [number, number, number],
      };
    });
  }, [matrices]);

  return (
    <InstancedRigidBodies
      // Якщо це "рослини/лопаті/декор", яких не рухаємо — фіксовані:
      type={physicsData.type}
      // Автогенерація коллайдерів: "hull" (швидко) або "trimesh" (точніше, але важче; краще для fixed)
      colliders={physicsData.colliders}
      instances={instances}
      restitution={physicsData.restitution}
      friction={physicsData.friction}
      mass={physicsData.mass}
    >
      <instancedMesh
        ref={meshRef}
        args={[geometry, material, COUNT]}
        receiveShadow
        castShadow
      />
    </InstancedRigidBodies>
  );
};

export default AddModelPhysics;
