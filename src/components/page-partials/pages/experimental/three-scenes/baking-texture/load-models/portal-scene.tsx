import { useGLTF, useTexture } from "@react-three/drei";
import { useControls } from "leva";
import { JSX, useEffect, useMemo } from "react";
import { Color, Mesh, MeshBasicMaterial, MeshStandardMaterial } from "three";

const path = "/3d-models/portal-scene/portal_scene.glb";
const texturePath = "/3d-models/portal-scene/backed_portal.jpg";

export function PortalScene(props: JSX.IntrinsicElements["group"]) {
  const { nodes, materials } = useGLTF(path);
  const bakedTexture = useTexture(texturePath);
  bakedTexture.flipY = false;
  bakedTexture.colorSpace = "srgb";
  const { tint, emissive, emissiveIntensity } = useControls({
    tint: { value: "#7f7986", label: "Baked tint" },
    emissive: { value: "#d88e52", label: "Lamp emissive" },
    emissiveIntensity: { value: 20, label: "Lamp emissive intensity" },
  });
  const bakedMat = useMemo(
    () =>
      new MeshStandardMaterial({
        map: bakedTexture,
        roughness: 1,
        metalness: 0,
        color: tint,
      }),
    [bakedTexture, tint],
  );

  const lampMat = useMemo(() => {
    const m = (materials["ligt-lamp"] as MeshStandardMaterial).clone();
    m.emissive = new Color(emissive); // колір свічення
    m.emissiveIntensity = 5; // сила (підбери на око)
    // m.emissiveMap = someTexture;        // опційно, якщо є окрема карта
    m.needsUpdate = true;
    return m;
  }, [materials, emissive]);

  useEffect(
    () => () => {
      bakedMat.dispose();
      lampMat.dispose();
    },
    [bakedMat, lampMat],
  );
  return (
    <group {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.Circle as Mesh).geometry}
        material={new MeshBasicMaterial({ color: "#ffffff" })}
        position={[-0.027, 1.49, -3.416]}
        rotation={[Math.PI / 2, 0, 0]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes["pole-lights024"] as Mesh).geometry}
        material={bakedMat}
        position={[2.894, 0.223, 0.673]}
        rotation={[0.028, -0.01, 0]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes["pole-lights025"] as Mesh).geometry}
        material={bakedMat}
        position={[2.894, 0.449, 0.68]}
        rotation={[0.028, -0.01, 0]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes["pole-lights026"] as Mesh).geometry}
        material={bakedMat}
        position={[3.044, 1.746, 0.717]}
        rotation={[0.028, -0.01, 1.571]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes["pole-lights027"] as Mesh).geometry}
        material={bakedMat}
        position={[2.481, 1.761, 0.712]}
        rotation={[0.028, -0.01, 3.141]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes["pole-lights028"] as Mesh).geometry}
        material={bakedMat}
        position={[2.481, 1.338, 0.7]}
        rotation={[0.028, -0.01, 0]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes["pole-lights001"] as Mesh).geometry}
        material={bakedMat}
        position={[2.218, 0.223, -1.971]}
        rotation={[0.028, -0.123, 0.003]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes["pole-lights002"] as Mesh).geometry}
        material={bakedMat}
        position={[2.218, 0.449, -1.964]}
        rotation={[0.028, -0.123, 0.003]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes["pole-lights003"] as Mesh).geometry}
        material={bakedMat}
        position={[2.362, 1.746, -1.91]}
        rotation={[0.028, -0.123, 1.574]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes["pole-lights004"] as Mesh).geometry}
        material={bakedMat}
        position={[1.804, 1.761, -1.979]}
        rotation={[0.028, -0.123, -3.139]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes["pole-lights018"] as Mesh).geometry}
        material={bakedMat}
        position={[1.805, 1.338, -1.99]}
        rotation={[0.028, -0.123, 0.003]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes["pole-lights012"] as Mesh).geometry}
        material={bakedMat}
        position={[-2.612, 0.223, 2.097]}
        rotation={[3.114, 0.039, -3.141]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes["pole-lights013"] as Mesh).geometry}
        material={bakedMat}
        position={[-2.612, 0.449, 2.091]}
        rotation={[3.114, 0.039, -3.141]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes["pole-lights014"] as Mesh).geometry}
        material={bakedMat}
        position={[-2.761, 1.746, 2.049]}
        rotation={[3.114, 0.039, -1.57]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes["pole-lights015"] as Mesh).geometry}
        material={bakedMat}
        position={[-2.198, 1.761, 2.071]}
        rotation={[3.114, 0.039, 0.001]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes["pole-lights016"] as Mesh).geometry}
        material={bakedMat}
        position={[-2.198, 1.338, 2.082]}
        rotation={[3.114, 0.039, -3.141]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes["pole-lights006"] as Mesh).geometry}
        material={bakedMat}
        position={[-2.517, 0.223, -1.108]}
        rotation={[3.114, 0.112, -3.139]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes["pole-lights007"] as Mesh).geometry}
        material={bakedMat}
        position={[-2.516, 0.449, -1.114]}
        rotation={[3.114, 0.112, -3.139]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes["pole-lights008"] as Mesh).geometry}
        material={bakedMat}
        position={[-2.661, 1.746, -1.167]}
        rotation={[3.114, 0.112, -1.568]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes["pole-lights009"] as Mesh).geometry}
        material={bakedMat}
        position={[-2.102, 1.761, -1.104]}
        rotation={[3.114, 0.112, 0.003]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes["pole-lights010"] as Mesh).geometry}
        material={bakedMat}
        position={[-2.103, 1.338, -1.092]}
        rotation={[3.114, 0.112, -3.139]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.fance as Mesh).geometry}
        material={bakedMat}
        position={[-1.943, 0, 1.221]}
        rotation={[0, -0.007, 0]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.fance001 as Mesh).geometry}
        material={bakedMat}
        position={[-1.89, 0, -0.488]}
        rotation={[0, -0.078, 0]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.fance002 as Mesh).geometry}
        material={bakedMat}
        position={[-1.89, 0, -2.081]}
        rotation={[0, 0.086, 0]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.fance003 as Mesh).geometry}
        material={bakedMat}
        position={[1.869, 0, 3.101]}
        rotation={[-Math.PI, 0.03, -Math.PI]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.fance004 as Mesh).geometry}
        material={bakedMat}
        position={[1.848, 0, 1.529]}
        rotation={[Math.PI, -0.067, Math.PI]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.fance005 as Mesh).geometry}
        material={bakedMat}
        position={[1.604, 0, -0.053]}
        rotation={[Math.PI, -0.193, Math.PI]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.fance006 as Mesh).geometry}
        material={bakedMat}
        position={[1.572, 0, -1.635]}
        rotation={[-Math.PI, 0.035, -Math.PI]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.fance007 as Mesh).geometry}
        material={bakedMat}
        position={[-2.018, 0, 2.931]}
        rotation={[0, -0.081, 0]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.ground as Mesh).geometry}
        material={bakedMat}
      />
      <group position={[2.601, 0, 2.516]}>
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.Cylinder as Mesh).geometry}
          material={bakedMat}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.Cylinder_1 as Mesh).geometry}
          material={bakedMat}
        />
      </group>
      <group position={[3.16, 0, 2.403]}>
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.Cylinder001 as Mesh).geometry}
          material={bakedMat}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.Cylinder001_1 as Mesh).geometry}
          material={bakedMat}
        />
      </group>
      <group position={[2.881, 0, 2.888]}>
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.Cylinder002 as Mesh).geometry}
          material={bakedMat}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.Cylinder002_1 as Mesh).geometry}
          material={bakedMat}
        />
      </group>
      <group position={[2.609, 0, 1.877]}>
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.Cylinder003 as Mesh).geometry}
          material={bakedMat}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.Cylinder003_1 as Mesh).geometry}
          material={bakedMat}
        />
      </group>
      <group position={[3.121, 0.046, 1.856]} rotation={[0.752, 0.997, 0.358]}>
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.Cylinder004 as Mesh).geometry}
          material={bakedMat}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.Cylinder004_1 as Mesh).geometry}
          material={bakedMat}
        />
      </group>
      <group position={[2.837, 0.167, 2.838]} rotation={[0, 0.319, 0]}>
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.Cylinder005 as Mesh).geometry}
          material={bakedMat}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.Cylinder005_1 as Mesh).geometry}
          material={bakedMat}
        />
      </group>
      <group position={[3.615, 0.102, 2.279]} rotation={[1.225, -1.09, -0.409]}>
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.Cylinder006 as Mesh).geometry}
          material={bakedMat}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.Cylinder006_1 as Mesh).geometry}
          material={bakedMat}
        />
      </group>
      <group
        position={[3.597, 0.058, 2.295]}
        rotation={[-1.482, -0.35, -2.944]}
      >
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.Cylinder007 as Mesh).geometry}
          material={bakedMat}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.Cylinder007_1 as Mesh).geometry}
          material={bakedMat}
        />
      </group>
      <group
        position={[3.254, -0.003, 2.874]}
        rotation={[-1.221, -0.114, -0.848]}
      >
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.Cylinder008 as Mesh).geometry}
          material={bakedMat}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.Cylinder008_1 as Mesh).geometry}
          material={bakedMat}
        />
      </group>
      <group position={[3.196, 0.786, 2.565]} rotation={[1.728, -1.205, 1.822]}>
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.Cube009 as Mesh).geometry}
          material={bakedMat}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.Cube009_1 as Mesh).geometry}
          material={bakedMat}
        />
      </group>
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.rock as Mesh).geometry}
        material={bakedMat}
        position={[-3.078, -0.077, 1.562]}
        rotation={[-0.258, 0.035, 0.285]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.rock001 as Mesh).geometry}
        material={bakedMat}
        position={[-3.193, 0.068, -1.736]}
        rotation={[-0.523, 0.118, -0.163]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.rock002 as Mesh).geometry}
        material={bakedMat}
        position={[3.392, 0.166, -0.579]}
        rotation={[-1.454, 1.211, 1.509]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.rock003 as Mesh).geometry}
        material={bakedMat}
        position={[3.033, 0, -2.375]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.rock004 as Mesh).geometry}
        material={bakedMat}
        position={[2.925, 0, -1.619]}
        rotation={[0, -1.44, 0]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.rock005 as Mesh).geometry}
        material={bakedMat}
        position={[2.298, 0.213, -0.889]}
        rotation={[2.881, 0.66, -1.496]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.rock006 as Mesh).geometry}
        material={bakedMat}
        position={[2.566, 0.421, -2.972]}
        rotation={[-3.059, 0.752, 2.684]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.rock007 as Mesh).geometry}
        material={bakedMat}
        position={[-2.89, 0.126, -2.488]}
        rotation={[1.979, -0.813, 0.881]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.rock008 as Mesh).geometry}
        material={bakedMat}
        position={[-3.491, 0.305, -2.203]}
        rotation={[-1.722, 0.933, 0.228]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.rock009 as Mesh).geometry}
        material={bakedMat}
        position={[-3.452, 0.089, 0.178]}
        rotation={[-1.333, 0.771, 0.479]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.rock010 as Mesh).geometry}
        material={bakedMat}
        position={[-2.762, -0.019, 0.108]}
        rotation={[-0.912, 0.727, 1.525]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.rock011 as Mesh).geometry}
        material={bakedMat}
        position={[-2.977, 0.031, -0.373]}
        rotation={[-1.552, 0.251, -2.168]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.rock012 as Mesh).geometry}
        material={bakedMat}
        position={[-3.045, 0.031, 0.487]}
        rotation={[-3.036, 0.498, -2.52]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.rock013 as Mesh).geometry}
        material={bakedMat}
        position={[-3.623, 0.031, 0.526]}
        rotation={[-3.035, 0.093, -2.639]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.rock014 as Mesh).geometry}
        material={bakedMat}
        position={[-3.438, 0.031, -0.17]}
        rotation={[-2.831, 1.218, -2.886]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.rock015 as Mesh).geometry}
        material={bakedMat}
        position={[-2.99, 0.031, -0.023]}
        rotation={[-1.195, -1.198, -0.153]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.rock016 as Mesh).geometry}
        material={bakedMat}
        position={[-3.374, 0.089, 0.857]}
        rotation={[-1.041, 0.405, 0.414]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.rock017 as Mesh).geometry}
        material={bakedMat}
        position={[-3.747, 0.031, 0.164]}
        rotation={[-3.076, 0.533, -2.097]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.rock018 as Mesh).geometry}
        material={bakedMat}
        position={[-3.428, 0.089, 0.495]}
        rotation={[-1.001, 0.518, -0.02]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.rock019 as Mesh).geometry}
        material={bakedMat}
        position={[-3.175, 0.025, -1.252]}
        rotation={[-2.832, -0.322, -2.362]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.rock020 as Mesh).geometry}
        material={bakedMat}
        position={[2.428, 0.089, -0.01]}
        rotation={[-1.454, 1.211, 1.509]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.rock021 as Mesh).geometry}
        material={bakedMat}
        position={[-3.376, 0.064, 2.649]}
        rotation={[1.042, 1.143, -0.28]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.rock022 as Mesh).geometry}
        material={bakedMat}
        position={[-3.221, 0.384, 3.538]}
        rotation={[1.202, 1.001, -0.13]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.portal as Mesh).geometry}
        material={bakedMat}
        position={[0.884, -0.077, -3.429]}
        rotation={[0, 0, 0.531]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.portal001 as Mesh).geometry}
        material={bakedMat}
        position={[1.346, 0.31, -3.429]}
        rotation={[0, 0, 0.865]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.portal002 as Mesh).geometry}
        material={bakedMat}
        position={[1.662, 0.845, -3.429]}
        rotation={[0, 0, 1.21]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.portal003 as Mesh).geometry}
        material={bakedMat}
        position={[1.778, 1.455, -3.429]}
        rotation={[0, 0, 1.555]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.portal004 as Mesh).geometry}
        material={bakedMat}
        position={[1.681, 2.069, -3.429]}
        rotation={[0, 0, 1.9]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.portal005 as Mesh).geometry}
        material={bakedMat}
        position={[1.383, 2.614, -3.429]}
        rotation={[0, 0, 2.245]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.portal006 as Mesh).geometry}
        material={bakedMat}
        position={[0.917, 3.026, -3.429]}
        rotation={[0, 0, 2.59]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.portal007 as Mesh).geometry}
        material={bakedMat}
        position={[0.34, 3.256, -3.429]}
        rotation={[0, 0, 2.935]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.portal008 as Mesh).geometry}
        material={bakedMat}
        position={[-0.281, 3.278, -3.429]}
        rotation={[0, 0, -3.003]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.portal009 as Mesh).geometry}
        material={bakedMat}
        position={[-0.873, 3.088, -3.429]}
        rotation={[0, 0, -2.658]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.portal010 as Mesh).geometry}
        material={bakedMat}
        position={[-1.366, 2.709, -3.429]}
        rotation={[0, 0, -2.313]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.portal011 as Mesh).geometry}
        material={bakedMat}
        position={[-1.701, 2.186, -3.429]}
        rotation={[0, 0, -1.968]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.portal012 as Mesh).geometry}
        material={bakedMat}
        position={[-1.84, 1.58, -3.429]}
        rotation={[0, 0, -1.623]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.portal013 as Mesh).geometry}
        material={bakedMat}
        position={[-1.766, 0.963, -3.429]}
        rotation={[0, 0, -1.278]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.portal014 as Mesh).geometry}
        material={bakedMat}
        position={[-1.488, 0.407, -3.429]}
        rotation={[0, 0, -0.933]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.portal015 as Mesh).geometry}
        material={bakedMat}
        position={[-1.038, -0.021, -3.429]}
        rotation={[0, 0, -0.588]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes["portal-stars"] as Mesh).geometry}
        material={bakedMat}
        position={[-0.004, 0.2, -2.931]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes["portal-stars001"] as Mesh).geometry}
        material={bakedMat}
        position={[-0.009, 0.095, -2.565]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes["portal-stars002"] as Mesh).geometry}
        material={bakedMat}
        position={[-0.004, -0.011, -2.244]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes["portal-stars003"] as Mesh).geometry}
        material={bakedMat}
        position={[-0.004, -0.106, -1.957]}
      />

      <mesh
        castShadow
        receiveShadow
        geometry={(nodes["pole-lights1"] as Mesh).geometry}
        material={lampMat}
        position={[2.481, 1.338, 0.706]}
      />
      <pointLight
        position={[2.481, 1.338, 0.706]}
        color={emissive}
        intensity={emissiveIntensity}
        distance={10}
        decay={2}
        castShadow
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes["pole-lights2"] as Mesh).geometry}
        material={lampMat}
        position={[-2.108, 1.338, -1.092]}
        rotation={[3.114, 0.039, -3.141]}
      />
      <pointLight
        position={[-2.108, 1.338, -1.092]}
        color={emissive}
        intensity={emissiveIntensity}
        distance={10}
        decay={2}
        castShadow
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes["pole-lights3"] as Mesh).geometry}
        material={lampMat}
        position={[-2.198, 1.34, 2.082]}
        rotation={[3.114, 0.039, -3.141]}
      />
      <pointLight
        position={[-2.198, 1.34, 2.082]}
        color={emissive}
        intensity={emissiveIntensity}
        distance={10}
        decay={2}
        castShadow
      />

      <mesh
        castShadow
        receiveShadow
        geometry={(nodes["pole-lights4"] as Mesh).geometry}
        material={lampMat}
        position={[1.806, 1.339, -1.991]}
        rotation={[0.028, -0.162, 0.004]}
      />
      <pointLight
        position={[1.806, 1.339, -1.991]}
        color={emissive}
        intensity={emissiveIntensity}
        distance={10}
        decay={2}
        castShadow
      />
    </group>
  );
}

useGLTF.preload(path);
useTexture.preload(texturePath);
