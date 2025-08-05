import { Gltf } from "@react-three/drei";
import { JSX, useRef } from "react";
import Frame from "./frame";
import ArtFrontFirstMaterial from "./shader-materials/art-front-first-material";
import { ShaderMaterial } from "three";
import ArtFrontSecondMaterial from "./shader-materials/art-front-second-material";
import ArtFrontThirdMaterial from "./shader-materials/art-front-third-material";
import { degToRad } from "three/src/math/MathUtils.js";
import ArtRightFirstMaterial from "./shader-materials/art-right-first-material";
import ArtLeftFirstMaterial from "./shader-materials/art-left-first-material";
import ArtLeftSecondMaterial from "./shader-materials/art-left-second-material";
import ArtLeftThirdMaterial from "./shader-materials/art-left-third-material";
import ArtRearFirstMaterial from "./shader-materials/art-rear-first-material";
import ArtRearSecondMaterial from "./shader-materials/art-rear-second-material";
import ArtRearThirdMaterial from "./shader-materials/art-rear-third-material";
import ArtRearFourthMaterial from "./shader-materials/art-rear-fourth-material";
import { useFrame } from "@react-three/fiber";

type Props = JSX.IntrinsicElements["group"] & {};

const Gallery = ({ ...props }: Props) => {
  const frameRefs = useRef<Record<string, ShaderMaterial | null>>({});

  useFrame(({ clock }) => {
    Object.values(frameRefs.current).forEach((material) => {
      if (material && "uniforms" in material) {
        material.uniforms.uTime.value = clock.getElapsedTime();
      }
    });
  });
  return (
    <group {...props}>
      <Gltf src={"/3d-models/room/vr_gallery.glb"} />
      {/* FRONT FRAMES */}
      <group position-z={-5}>
        <Frame
          position-x={-3}
          position-y={1.3}
          width={1}
          height={1}
          borderSize={0.05}
          color={"#555555"}
        >
          <mesh>
            <planeGeometry args={[0.8, 0.8]} />
            <ArtFrontFirstMaterial
              uColor="pink"
              ref={
                ((ref) => {
                  frameRefs.current.front01 = ref;
                }) as React.Ref<ShaderMaterial>
              }
            />
          </mesh>
        </Frame>

        <Frame
          position-x={0}
          position-y={1.3}
          width={1.2}
          height={1.6}
          borderSize={0.05}
          color={"black"}
        >
          <mesh>
            <planeGeometry args={[1, 1.4]} />
            <ArtFrontSecondMaterial
              uColor="mediumpurple"
              ref={
                ((ref) => {
                  frameRefs.current.front02 = ref;
                }) as React.Ref<ShaderMaterial>
              }
            />
          </mesh>
        </Frame>

        <Frame
          position-x={3}
          position-y={1.3}
          width={1.4}
          height={0.8}
          borderSize={0.05}
          color={"#555555"}
        >
          <mesh>
            <planeGeometry args={[1.2, 0.6]} />
            <ArtFrontThirdMaterial
              uResolution={[1.2, 0.6]}
              uColor="red"
              ref={
                ((ref) => {
                  frameRefs.current.front03 = ref;
                }) as React.Ref<ShaderMaterial>
              }
            />
          </mesh>
        </Frame>
      </group>

      {/* RIGHT WALL */}
      <group rotation-y={degToRad(-90)} position-x={5}>
        <Frame position-y={1.5} width={5} height={2} borderSize={0.2}>
          <mesh>
            <planeGeometry args={[5, 2, 1]} />
            <ArtRightFirstMaterial
              uColor="black"
              ref={
                ((ref) => {
                  frameRefs.current.right01 = ref;
                }) as React.Ref<ShaderMaterial>
              }
            />
          </mesh>
        </Frame>
      </group>

      {/* LEFT WALL */}
      <group position-x={-5} rotation-y={degToRad(90)}>
        <Frame
          position-y={1.5}
          position-x={-3.2}
          width={1}
          height={2}
          borderSize={0.05}
        >
          <mesh>
            <planeGeometry args={[1, 2]} />
            <ArtLeftFirstMaterial
              uColor="black"
              ref={
                ((ref) => {
                  frameRefs.current.left01 = ref;
                }) as React.Ref<ShaderMaterial>
              }
            />
          </mesh>
        </Frame>

        <Frame position-y={1.5} width={3.6} height={2}>
          <mesh>
            <planeGeometry args={[3.4, 1.8, 1]} />
            <ArtLeftSecondMaterial
              uColor="black"
              ref={
                ((ref) => {
                  frameRefs.current.left02 = ref;
                }) as React.Ref<ShaderMaterial>
              }
            />
          </mesh>
        </Frame>

        <Frame
          position-y={1.5}
          position-x={3.2}
          width={1}
          height={2}
          borderSize={0.05}
        >
          <mesh>
            <planeGeometry args={[1, 2]} />
            <ArtLeftThirdMaterial
              uColor="black"
              ref={
                ((ref) => {
                  frameRefs.current.left03 = ref;
                }) as React.Ref<ShaderMaterial>
              }
            />
          </mesh>
        </Frame>
      </group>

      {/* REAR WALL */}

      <group position-z={5} rotation-y={degToRad(180)}>
        <Frame
          position-y={1.5}
          position-x={-2.5}
          width={1}
          height={1}
          borderSize={0.2}
        >
          <mesh>
            <planeGeometry args={[1, 1]} />
            <ArtRearFirstMaterial
              uColor="black"
              ref={
                ((ref) => {
                  frameRefs.current.rear01 = ref;
                }) as React.Ref<ShaderMaterial>
              }
            />
          </mesh>
        </Frame>

        <Frame
          position-y={2.2}
          position-x={2.75}
          width={0.5}
          height={0.5}
          borderSize={0.025}
        >
          <mesh>
            <planeGeometry args={[0.4, 0.4]} />
            <ArtRearSecondMaterial
              uColor="black"
              ref={
                ((ref) => {
                  frameRefs.current.rear02 = ref;
                }) as React.Ref<ShaderMaterial>
              }
            />
          </mesh>
        </Frame>

        <Frame
          position-y={1.5}
          position-x={2.75}
          width={0.5}
          height={0.5}
          borderSize={0.025}
        >
          <mesh>
            <planeGeometry args={[0.4, 0.4]} />
            <ArtRearThirdMaterial
              uColor="black"
              ref={
                ((ref) => {
                  frameRefs.current.rear03 = ref;
                }) as React.Ref<ShaderMaterial>
              }
            />
          </mesh>
        </Frame>

        <Frame
          position-y={0.8}
          position-x={2.75}
          width={0.5}
          height={0.5}
          borderSize={0.025}
        >
          <mesh>
            <planeGeometry args={[0.4, 0.4]} />
            <ArtRearFourthMaterial
              uColor="black"
              ref={
                ((ref) => {
                  frameRefs.current.rear04 = ref;
                }) as React.Ref<ShaderMaterial>
              }
            />
          </mesh>
        </Frame>
      </group>
    </group>
  );
};

export default Gallery;
