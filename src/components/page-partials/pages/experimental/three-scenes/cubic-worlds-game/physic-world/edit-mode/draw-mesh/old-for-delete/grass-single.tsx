import {
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import {
  BufferGeometry,
  InstancedBufferAttribute,
  InstancedMesh,
  Material,
  Matrix4,
  NormalBufferAttributes,
  Object3D,
  Quaternion,
  ShaderMaterial,
  Vector3,
} from "three";
import { useFrame } from "@react-three/fiber";

type GrassSingleProps = {
  matrix: Matrix4;
  geometry: BufferGeometry<NormalBufferAttributes>;
  material: Material;
};

const GrassSingle = forwardRef<InstancedMesh, GrassSingleProps>(
  ({ matrix, geometry, material }, ref) => {
    const dummy = useMemo(() => new Object3D(), []);
    const grassMaterialRef = useRef<ShaderMaterial>(null!);
    const meshRef = useRef<InstancedMesh>(null);
    useImperativeHandle(ref, () => meshRef.current as InstancedMesh);
    // фіксовані внутрішні коефіцієнти масштабу від діаметра
    useLayoutEffect(() => {
      if (!meshRef.current) return;

      // масштаб від діаметра круга
      matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);
      // ✅ коректор: Y -> Z (90° навколо X)

      const qYtoZ = new Quaternion().setFromAxisAngle(
        new Vector3(1, 0, 0),
        Math.PI / 2
      );
      // спочатку застосуємо Y->Z до леза, потім Z->normal (твій rotation)
      const qFinal = dummy.quaternion.clone().multiply(qYtoZ);
      // позиція/орієнтація: беремо з DrawMesh; без додаткового yaw
      dummy.quaternion.copy(qFinal);
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
    }, [matrix, dummy]);

    useFrame((_, dt) => {
      if (!grassMaterialRef.current) return;
      grassMaterialRef.current.uniforms.time.value += dt;
    });

    return (
      <instancedMesh
        ref={meshRef}
        args={[geometry, material, 1]}
        receiveShadow
        frustumCulled={false}
      />
    );
  }
);

export default GrassSingle;
