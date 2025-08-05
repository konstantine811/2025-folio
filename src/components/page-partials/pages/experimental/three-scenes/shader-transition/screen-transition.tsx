import { Hud, OrthographicCamera, shaderMaterial } from "@react-three/drei";
import { extend, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Color, MathUtils, ShaderMaterial } from "three";
import { TRANSITION_DURATION } from "./config/ui.config";

const vertexShader = /* glsl */ `
    varying vec2 vUv;
    
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;
const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uProgression;
  varying vec2 vUv;
  uniform vec2 uResolution;
  const float pi = 3.141592654;

  void main() {
    vec2 uvs = vUv - 0.5;
    uvs.x *= uResolution.x / uResolution.y;
	  float r = length(uvs * 0.92);
    float theta = atan(uvs.y, uvs.x);   
    float spiral = fract(2.5 * theta / pi + 7.0 * pow(r, 0.4) - 4.5 * uProgression);
    float animatedProgression = smoothstep(0.25, 1.0, uProgression);
    float alphaSpiral = step(animatedProgression, spiral);
    float animatedProgressionCircle = smoothstep(0.25, 0.8,uProgression);
    float alphaCircle = step(animatedProgressionCircle, r);
    float alpha = max(alphaSpiral, alphaCircle);

    float animatedProgressionOut = smoothstep(0.5, 1.0, uProgression);
    float alphaCircleOut = step(animatedProgressionOut, r);
    alpha = min(alpha, alphaCircleOut);

    vec3 darkenColor = uColor * 0.2;
    vec3 finalColor = mix(uColor, darkenColor, smoothstep(0.42, 0.8, uProgression));
    
    gl_FragColor = vec4(finalColor, alpha);
  }
`;
const ScreenTransitionMaterial = shaderMaterial(
  {
    uColor: new Color("pink"),
    uProgression: 0,
    uResolution: [0, 0],
  },
  vertexShader,
  fragmentShader
);

extend({ ScreenTransitionMaterial });

const ScreenTransition = ({
  color,
  transition,
}: {
  color: string;
  transition: boolean;
}) => {
  const transitionMaterial = useRef<ShaderMaterial>(null!);
  const transitionData = useRef({
    from: 0,
    to: 0,
    started: 0,
  });
  const { gl } = useThree();
  const { clientHeight, clientWidth } = gl.domElement;

  useEffect(() => {
    transitionData.current.from =
      transition && transitionData.current.started ? 1 : 0;
    transitionData.current.to = transition ? 0 : 1;
    transitionData.current.started = new Date().getTime();
  }, [transition]);

  useFrame(() => {
    transitionMaterial.current.uniforms.uResolution.value = [
      clientWidth,
      clientHeight,
    ];
    transitionMaterial.current.uniforms.uProgression.value = MathUtils.lerp(
      transitionData.current.from,
      transitionData.current.to,
      (new Date().getTime() - transitionData.current.started) /
        (TRANSITION_DURATION * 1000)
    );
  });
  return (
    <Hud>
      <OrthographicCamera
        makeDefault
        top={1}
        right={1}
        bottom={-1}
        left={-1}
        near={0}
        far={1}
      />
      <mesh>
        <planeGeometry args={[2, 2]} />
        <screenTransitionMaterial
          ref={transitionMaterial}
          attach="material"
          uColor={color}
          uProgression={transition ? 0 : 1}
          transparent
          toneMapped={false}
        />
      </mesh>
    </Hud>
  );
};

export default ScreenTransition;
