import { useGLTF } from "@react-three/drei";
import { JSX, useEffect, useRef, useState } from "react";
import { CAKE_TRANSITION_DURATION } from "./config/ui.config";
import { useFrame } from "@react-three/fiber";
import { MathUtils } from "three";
import { degToRad } from "three/src/math/MathUtils.js";
import { useSpring, animated } from "@react-spring/three";

type Props = JSX.IntrinsicElements["group"] & {
  model: string;
  visible: boolean;
};

const declarationFragment = /* glsl */ `
  float myRand(vec2 n) { 
      return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
  }

  float noise(vec2 p){
    vec2 ip = floor(p);
    vec2 u = fract(p);
    u = u*u*(3.0-2.0*u);
    
    float res = mix(
      mix(myRand(ip),myRand(ip+vec2(1.0,0.0)),u.x),
      mix(myRand(ip+vec2(0.0,1.0)),myRand(ip+vec2(1.0,1.0)),u.x),u.y);
    return res*res;
  }
  uniform float uProgression;
`;

const fadeFragment = /* glsl */ `
  float noiseFactor = noise(gl_FragCoord.xy * 0.042);
  float yProgression = smoothstep(-5.0, 5.0, vPosition.y);
  yProgression = smoothstep(0.20, yProgression, uProgression);
  noiseFactor = step(1.0 - yProgression, noiseFactor);
  diffuseColor.a = diffuseColor.a * noiseFactor;
`;

const colorWashFragment = /* glsl */ `
  vec3 color = vec3(1.0, 1.0, 1.0);
  gl_FragColor.rgb = mix(color, gl_FragColor.rgb, yProgression);
  `;

const varyingFragment = /* glsl */ `
  varying vec3 vPosition;
  `;

const applyVaryingFragment = /* glsl */ `
  // use world position to apply the effect
  vPosition = gl_Position.xyz;
  `;

const TransitionModel = ({ model, visible, ...props }: Props) => {
  const { scene, materials } = useGLTF(
    `/3d-models/shader-transition-model/${model}.glb`
  );
  const transitionData = useRef({
    from: 0,
    to: 1,
    started: 0,
  });
  const [animatedVisible, setAnimatedVisible] = useState(visible);

  const { scale, rotationX, rotationY, y } = useSpring({
    scale: visible ? 1 : 0.8,
    rotationY: visible ? 0 : degToRad(20),
    rotationX: visible ? 0 : degToRad(20),
    y: visible ? 0 : 0.1,
    delay: visible ? CAKE_TRANSITION_DURATION * 1.5 * 1000 : 0,
  });

  useEffect(() => {
    if (visible === animatedVisible) {
      return;
    }
    if (!visible) {
      transitionData.current.from = 1;
      transitionData.current.to = 0;
      transitionData.current.started = new Date().getTime();
    }
    const timeout = setTimeout(() => {
      if (visible) {
        transitionData.current.from = 0;
        transitionData.current.to = 1;
        transitionData.current.started = new Date().getTime();
      }
      setAnimatedVisible(visible);
    }, CAKE_TRANSITION_DURATION * 1000);

    return () => clearTimeout(timeout);
  }, [visible, animatedVisible]);

  useEffect(() => {
    Object.values(materials).forEach((material) => {
      material.transparent = true;
      material.onBeforeCompile = (shader) => {
        shader.uniforms.uProgression = { value: 0 };
        material.userData.shader = shader;
        shader.vertexShader = shader.vertexShader.replace(
          `void main() {`,
          `${varyingFragment} void main() {`
        );
        shader.vertexShader = shader.vertexShader.replace(
          `#include <fog_vertex>`,
          `#include <fog_vertex>
          ${applyVaryingFragment}`
        );
        shader.fragmentShader = shader.fragmentShader.replace(
          `void main() {`,
          `${declarationFragment} ${varyingFragment} void main() {`
        );
        shader.fragmentShader = shader.fragmentShader.replace(
          `#include <alphamap_fragment>`,
          `#include <alphamap_fragment>
          ${fadeFragment}`
        );
        shader.fragmentShader = shader.fragmentShader.replace(
          `#include <tonemapping_fragment>`,
          `${colorWashFragment} #include <tonemapping_fragment>`
        );
      };
    });
  }, [materials]);

  useFrame(() => {
    Object.values(materials).forEach((material) => {
      if (material.userData.shader) {
        material.userData.shader.uniforms.uProgression.value = MathUtils.lerp(
          transitionData.current.from,
          transitionData.current.to,
          (new Date().getTime() - transitionData.current.started) /
            (CAKE_TRANSITION_DURATION * 1000)
        );
      }
    });
  });
  return (
    <animated.group {...props} dispose={null} visible={animatedVisible}>
      <animated.group
        scale={scale}
        rotation-y={rotationY}
        rotation-x={rotationX}
        position-y={y}
      >
        <primitive object={scene} />
      </animated.group>
    </animated.group>
  );
};

export default TransitionModel;
