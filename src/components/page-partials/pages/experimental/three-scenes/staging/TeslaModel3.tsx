import { useGLTF } from "@react-three/drei";
import { JSX } from "react";
import { SkinnedMesh } from "three";

interface Props {
  props?: JSX.IntrinsicElements["group"];
}

function TeslaModel3({ props }: Props) {
  const { nodes, materials } = useGLTF(
    "/3d-models/staging-model/tesla_model_3.glb"
  );
  return (
    <group {...props} dispose={null}>
      <group
        position={[101.126, -11.645, -263.104]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={1.441}
      >
        <mesh
          geometry={(nodes.wheel003_Material013_0 as SkinnedMesh).geometry}
          material={materials["Material.013"]}
        />
        <mesh
          geometry={(nodes.wheel003_Material012_0 as SkinnedMesh).geometry}
          material={materials["Material.012"]}
        />
        <mesh
          geometry={(nodes.wheel003_Material011_0 as SkinnedMesh).geometry}
          material={materials["Material.011"]}
        />
        <mesh
          geometry={(nodes.wheel003_Material010_0 as SkinnedMesh).geometry}
          material={materials["Material.010"]}
        />
        <mesh
          geometry={(nodes.wheel003_Material009_0 as SkinnedMesh).geometry}
          material={materials["Material.009"]}
        />
      </group>
      <group
        position={[-111.33, -11.645, -263.104]}
        rotation={[-Math.PI / 2, 0, -Math.PI]}
        scale={1.441}
      >
        <mesh
          geometry={(nodes.wheel002_Material013_0 as SkinnedMesh).geometry}
          material={materials["Material.013"]}
        />
        <mesh
          geometry={(nodes.wheel002_Material012_0 as SkinnedMesh).geometry}
          material={materials["Material.012"]}
        />
        <mesh
          geometry={(nodes.wheel002_Material011_0 as SkinnedMesh).geometry}
          material={materials["Material.011"]}
        />
        <mesh
          geometry={(nodes.wheel002_Material010_0 as SkinnedMesh).geometry}
          material={materials["Material.010"]}
        />
        <mesh
          geometry={(nodes.wheel002_Material009_0 as SkinnedMesh).geometry}
          material={materials["Material.009"]}
        />
      </group>
      <group
        position={[-106.752, -9.98, 128.293]}
        rotation={[-Math.PI / 2, 0, 2.827]}
        scale={1.441}
      >
        <mesh
          geometry={(nodes.wheel001_Material013_0 as SkinnedMesh).geometry}
          material={materials["Material.013"]}
        />
        <mesh
          geometry={(nodes.wheel001_Material012_0 as SkinnedMesh).geometry}
          material={materials["Material.012"]}
        />
        <mesh
          geometry={(nodes.wheel001_Material011_0 as SkinnedMesh).geometry}
          material={materials["Material.011"]}
        />
        <mesh
          geometry={(nodes.wheel001_Material010_0 as SkinnedMesh).geometry}
          material={materials["Material.010"]}
        />
        <mesh
          geometry={(nodes.wheel001_Material009_0 as SkinnedMesh).geometry}
          material={materials["Material.009"]}
        />
      </group>
      <group
        position={[104.621, -9.98, 127.591]}
        rotation={[-Math.PI / 2, 0, -Math.PI / 10]}
        scale={1.441}
      >
        <mesh
          geometry={(nodes.wheel_Material013_0 as SkinnedMesh).geometry}
          material={materials["Material.013"]}
        />
        <mesh
          geometry={(nodes.wheel_Material012_0 as SkinnedMesh).geometry}
          material={materials["Material.012"]}
        />
        <mesh
          geometry={(nodes.wheel_Material011_0 as SkinnedMesh).geometry}
          material={materials["Material.011"]}
        />
        <mesh
          geometry={(nodes.wheel_Material010_0 as SkinnedMesh).geometry}
          material={materials["Material.010"]}
        />
        <mesh
          geometry={(nodes.wheel_Material009_0 as SkinnedMesh).geometry}
          material={materials["Material.009"]}
        />
      </group>
      <mesh
        geometry={(nodes.Capot013_Material017_0 as SkinnedMesh).geometry}
        material={materials["Material.017"]}
        position={[-3.529, 80.378, -64.195]}
        rotation={[-1.579, -0.003, 0.01]}
        scale={98.981}
      />
      <mesh
        geometry={(nodes.Capot010_Material016_0 as SkinnedMesh).geometry}
        material={materials["Material.016"]}
        position={[-3.448, 46.392, -67.627]}
        rotation={[-1.579, -0.003, 0.01]}
        scale={98.981}
      />
      <mesh
        geometry={(nodes.cal003_Material014_0 as SkinnedMesh).geometry}
        material={materials["Material.014"]}
        position={[103.397, -11.645, -263.104]}
        rotation={[0.035, 0, 0]}
        scale={1.328}
      />
      <mesh
        geometry={(nodes.cal002_Material014_0 as SkinnedMesh).geometry}
        material={materials["Material.014"]}
        position={[-113.602, -11.645, -263.104]}
        rotation={[0.035, 0, 0]}
        scale={[-1.328, 1.328, 1.328]}
      />
      <mesh
        geometry={(nodes.cal001_Material014_0 as SkinnedMesh).geometry}
        material={materials["Material.014"]}
        position={[-108.912, -9.98, 127.591]}
        rotation={[2.967, 0.31, 0.054]}
        scale={[-1.328, 1.328, 1.328]}
      />
      <mesh
        geometry={(nodes.Capot009_Material008_0 as SkinnedMesh).geometry}
        material={materials["Material.008"]}
        position={[-0.564, -15.438, 210.502]}
        rotation={[-1.579, -0.003, 0.01]}
        scale={98.981}
      />
      <mesh
        geometry={(nodes.Capot012_Material004_0 as SkinnedMesh).geometry}
        material={materials["Material.004"]}
        position={[-1.01, 43.242, 184.279]}
        rotation={[-1.579, -0.003, 0.01]}
        scale={98.981}
      />
      <mesh
        geometry={(nodes.Capot011_Material003_0 as SkinnedMesh).geometry}
        material={materials["Material.003"]}
        position={[-2.867, 74.363, 2.304]}
        rotation={[-1.579, -0.003, 0.01]}
        scale={98.981}
      />
      <mesh
        geometry={(nodes.Capot008_Material007_0 as SkinnedMesh).geometry}
        material={materials["Material.007"]}
        position={[-6.202, -8.407, -370.614]}
        rotation={[-1.579, -0.003, 0.01]}
        scale={98.981}
      />
      <mesh
        geometry={(nodes.Capot007_Material005_0 as SkinnedMesh).geometry}
        material={materials["Material.005"]}
        position={[-3.596, 49.969, -81.287]}
        rotation={[-1.579, -0.003, 0.01]}
        scale={98.981}
      />
      <mesh
        geometry={(nodes.Capot_Material002_0 as SkinnedMesh).geometry}
        material={materials["Material.002"]}
        position={[-3.841, 69.749, -100.531]}
        rotation={[-1.579, -0.003, 0.01]}
        scale={98.981}
      />
      <mesh
        geometry={(nodes.Capot001_CAR_PAINT_0 as SkinnedMesh).geometry}
        material={materials.CAR_PAINT}
        position={[-3.569, 50.83, -78.211]}
        rotation={[-1.579, -0.003, 0.01]}
        scale={98.981}
      />
      <mesh
        geometry={(nodes.Capot002_chrome_0 as SkinnedMesh).geometry}
        material={materials.chrome}
        position={[-3.209, 63.251, -36.725]}
        rotation={[-1.579, -0.003, 0.01]}
        scale={98.981}
      />
      <mesh
        geometry={(nodes.Capot003_Glass_0 as SkinnedMesh).geometry}
        material={materials.Glass}
        position={[-3.529, 80.378, -64.195]}
        rotation={[-1.579, -0.003, 0.01]}
        scale={98.981}
      />
      <mesh
        geometry={(nodes.Capot004_PLASTIC_0 as SkinnedMesh).geometry}
        material={materials.PLASTIC}
        position={[-3.448, 46.392, -67.627]}
        rotation={[-1.579, -0.003, 0.01]}
        scale={98.981}
      />
      <mesh
        geometry={(nodes.Capot005_LED_PHARE_0 as SkinnedMesh).geometry}
        material={materials.LED_PHARE}
        position={[-0.959, 26.857, 184.075]}
        rotation={[-1.579, -0.003, 0.01]}
        scale={98.981}
      />
      <mesh
        geometry={(nodes.Capot006_Material001_0 as SkinnedMesh).geometry}
        material={materials["Material.001"]}
        position={[-0.495, -15.637, 218.03]}
        rotation={[-1.579, -0.003, 0.01]}
        scale={98.981}
      />
      <mesh
        geometry={(nodes.cal_Material014_0 as SkinnedMesh).geometry}
        material={materials["Material.014"]}
        position={[106.782, -9.98, 128.293]}
        rotation={[2.967, 0.31, 0.054]}
        scale={1.328}
      />
      <mesh
        geometry={(nodes.int_Material015_0 as SkinnedMesh).geometry}
        material={materials["Material.015"]}
        position={[-4.286, 43.662, -72.575]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={3.536}
      />
    </group>
  );
}

useGLTF.preload("/3d-models/staging-model/tesla_model_3.glb");

export default TeslaModel3;
