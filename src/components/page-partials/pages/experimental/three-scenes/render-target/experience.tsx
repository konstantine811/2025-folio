import {
  ContactShadows,
  Environment,
  Gltf,
  OrbitControls,
  PerspectiveCamera,
  Sky,
  useFBO,
  useVideoTexture,
} from "@react-three/drei";
import Avatar from "./avatar";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Mesh, MeshBasicMaterial, Texture, Vector3 } from "three";
import { PerspectiveCamera as ThreePerspectiveCamera } from "three";
import useRemote from "./context/useRemote";

const VECTOR_ZERO = new Vector3(0, 0, 0);

const Experience = () => {
  const videoTexture = useVideoTexture("/videos/bounce-patrick.mp4");
  //   const cornerTarget = useFBO();
  //   const bufferRenderTarget = useFBO();
  const { mode } = useRemote();
  const tvMaterial = useRef<MeshBasicMaterial>(null);

  const frontCamera = useRef<ThreePerspectiveCamera>(null);
  const frontRenderTarget = useFBO();

  const topCamera = useRef<ThreePerspectiveCamera>(null);
  const topRenderTarget = useFBO();

  const cornerCamera = useRef<ThreePerspectiveCamera>(null);
  const cornerRenderTarget = useFBO();

  useFrame(({ gl, scene }) => {
    if (tvMaterial.current) {
      tvMaterial.current.map = videoTexture;
      let currentScreenTexture: Texture = videoTexture;

      if (mode === "top" && topCamera.current) {
        topCamera.current.lookAt(VECTOR_ZERO);
        currentScreenTexture = topRenderTarget.texture;
        // Renderign main scene with the top camera
        gl.setRenderTarget(topRenderTarget);
        gl.render(scene, topCamera.current);
      }

      if (mode === "corner" && cornerCamera.current) {
        cornerCamera.current.lookAt(VECTOR_ZERO);
        currentScreenTexture = cornerRenderTarget.texture;
        // Renderign main scene with the corner camera
        gl.setRenderTarget(cornerRenderTarget);
        gl.render(scene, cornerCamera.current);
      }

      if (mode === "front" && frontCamera.current) {
        frontCamera.current.lookAt(VECTOR_ZERO);
        // Open mouth of the avatar
        scene.traverse((node) => {
          if (node instanceof Mesh && node.morphTargetInfluences) {
            console.log(node.morphTargetDictionary);
            node.morphTargetInfluences[0] = 1;
            node.morphTargetInfluences[1] = 1;
          }
        });
        currentScreenTexture = frontRenderTarget.texture;
        // Renderign main scene with the front camera
        gl.setRenderTarget(frontRenderTarget);
        gl.render(scene, frontCamera.current);
      }

      gl.setRenderTarget(null);

      tvMaterial.current.map = currentScreenTexture;

      scene.traverse((node) => {
        if (node instanceof Mesh && node.morphTargetInfluences) {
          node.morphTargetInfluences[0] = 0;
          node.morphTargetInfluences[1] = 0;
        }
      });
    }
  });
  return (
    <>
      <PerspectiveCamera
        position={[0, 0, -0.3]}
        fov={50}
        near={0.1}
        ref={frontCamera}
      />
      <PerspectiveCamera
        position={[0, 2.2, 0]}
        fov={30}
        near={0.1}
        ref={topCamera}
      />
      <PerspectiveCamera
        position={[2, 1.2, 2]}
        fov={30}
        near={0.1}
        ref={cornerCamera}
      />
      <OrbitControls
        maxPolarAngle={Math.PI / 2}
        minDistance={2}
        maxDistance={5}
      />
      <group position-y={-0.5}>
        <group>
          <Sky />
          <Avatar
            props={{
              rotation: [0, Math.PI, 0],
              scale: 0.45,
              position: [0, 0, 0.34],
            }}
          />
          <Gltf
            src="/3d-models/render-target-model/Room.glb"
            scale={0.3}
            rotation-y={-Math.PI / 2}
          />
          <mesh position-x={0.055} position-y={0.48} position-z={-0.601}>
            <planeGeometry args={[0.63, 0.44]} />
            <meshBasicMaterial map={videoTexture} ref={tvMaterial} />
          </mesh>
        </group>
      </group>
      <Environment preset="sunset" />
      <ContactShadows position-y={-1} blur={2} opacity={0.42} />
    </>
  );
};

export default Experience;
