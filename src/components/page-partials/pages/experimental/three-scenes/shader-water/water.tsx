import { shaderMaterial, useFBO } from "@react-three/drei";
import { extend, useFrame, useThree } from "@react-three/fiber";
import { useControls } from "leva";
import { JSX, useRef } from "react";
import {
  Color,
  Mesh,
  MeshDepthMaterial,
  NoBlending,
  ShaderMaterial,
  RGBADepthPacking,
  FloatType,
} from "three";
import { resolveLygia } from "resolve-lygia";

type Props = JSX.IntrinsicElements["group"] & {};

const depthMaterial = new MeshDepthMaterial();
depthMaterial.depthPacking = RGBADepthPacking;
depthMaterial.blending = NoBlending;

const vertexShader = /*glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = resolveLygia(/*glsl */ `
  #include "lygia/generative/pnoise.glsl"
  #include "lygia/generative/voronoise.glsl"

  varying vec2 vUv;
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uTime;
  uniform float uSpeed;
  uniform float uRepeat;
  uniform int uNoiseType;
  uniform float uFoam;
  uniform float uFoamTop;
  uniform sampler2D uDepth;
  uniform float uMaxDepth;
  uniform vec2 uResolution;
  uniform float uCameraNear;
  uniform float uCameraFar;

  #include <packing>
  float getViewZ(const in float depth) {
    return perspectiveDepthToViewZ(depth, uCameraNear, uCameraFar);
  }

  float getDepth(const in vec2 screenPosition) {
    return unpackRGBAToDepth(texture2D(uDepth, screenPosition));
  }

  void main() {
    float adjustedTime = uTime * uSpeed;
    // NOISE GENERATION
    float noise = 0.0;
    if(uNoiseType == 0) {
        noise = pnoise(vec3(vUv * uRepeat, adjustedTime * 0.5), vec3(100.0, 24.0, 112.0));
    } else  if (uNoiseType == 1) {
        vec2 p = 0.5 - 0.5 * cos(adjustedTime * vec2(1.0, 0.5));
        p = p * p * (3.0 - 2.0 * p);
        p = p * p * (3.0 - 2.0 * p);
        p = p * p * (3.0 - 2.0 * p);
        noise = voronoise(vec3(vUv * uRepeat, adjustedTime), p.x, 1.0);
    }
 
    // DEPTH
    vec2 screenUV = gl_FragCoord.xy / uResolution;
    float fragmentLinearEyeDepth = getViewZ(gl_FragCoord.z);
    float linearEyeDepth = getViewZ(getDepth(screenUV));
    float depth = fragmentLinearEyeDepth - linearEyeDepth;
    noise += smoothstep(uMaxDepth, 0.0, depth);

       // FOAM EFFECT
    noise = smoothstep(uFoam, uFoamTop, noise);

    // COLOR
    vec3 intermediateColor = uColor * 1.8;
    vec3 topColor = intermediateColor * 2.0;
    vec3 finalColor = uColor;
    finalColor = mix(uColor, intermediateColor, step(0.01, noise));
    finalColor = mix(finalColor, topColor, step(1.0, noise));

    // if(depth > uMaxDepth) {
    //     finalColor = vec3(1.0, 0.0, 0.0);
    // } else {
    //     finalColor = vec3(depth);
    // }
    // gl_FragColor = vec4(finalColor, uOpacity);
    // === manual tonemapping & encoding ===
    vec4 toneMappedColor = vec4(finalColor, uOpacity);

    // simple Reinhard tonemapping
    toneMappedColor.rgb = toneMappedColor.rgb / (toneMappedColor.rgb + vec3(1.0));

    // sRGB encoding
    toneMappedColor.rgb = pow(toneMappedColor.rgb, vec3(1.0 / 2.2));

    gl_FragColor = toneMappedColor;
  }
`);

const WaterShaderMaterial = shaderMaterial(
  {
    uColor: new Color("#00c3ff"),
    uOpacity: 0.8,
    uTime: 0,
    uSpeed: 0.5,
    uRepeat: 20.0,
    uNoiseType: 0,
    uFoam: 0.4,
    uFoamTop: 0.7,
    uDepth: null,
    uMaxDepth: 1.0,
    uResolution: [0, 0],
    uCameraNear: 0,
    uCameraFar: 0,
  },
  vertexShader,
  fragmentShader
);

extend({ WaterShaderMaterial });

const Water = ({ ...props }: Props) => {
  const waterMaterialRef = useRef<ShaderMaterial>(null!);
  const waterRef = useRef<Mesh>(null!);
  const {
    waterOpacity,
    waterColor,
    speed,
    repeat,
    foam,
    foamTop,
    noiseType,
    maxDepth,
  } = useControls({
    waterOpacity: { value: 0.8, min: 0, max: 1 },
    waterColor: "#00c3ff",
    speed: { value: 0.5, min: 0, max: 5 },
    repeat: { value: 30, min: 1, max: 100 },
    foam: { value: 0.4, min: 0, max: 1 },
    foamTop: { value: 0.7, min: 0, max: 1 },
    noiseType: { value: 0, options: { Perlin: 0, Voronoi: 1 } },
    maxDepth: { value: 2, min: 0, max: 5 },
  });

  const { domElement } = useThree((state) => state.gl);

  const renderTarget = useFBO({
    depthBuffer: true,
    type: FloatType,
  });

  useFrame(({ clock, gl, camera, scene }) => {
    // We hide the water mesh and render the scene to the render tareget
    waterRef.current.visible = false;
    scene.overrideMaterial = depthMaterial; // It replaces the material of all meshes in the scene to store the deph values insdie the render target
    gl.setRenderTarget(renderTarget);
    gl.clear();
    gl.render(scene, camera);
    gl.setRenderTarget(null);

    // We reset the scene and show water mesh
    scene.overrideMaterial = null; // Comment this line if you want to visualize what happens in the render target
    waterRef.current.visible = true;

    if (waterMaterialRef.current) {
      waterMaterialRef.current.uniforms.uDepth.value = renderTarget.texture;
      const pixelRatio = gl.getPixelRatio();
      waterMaterialRef.current.uniforms.uResolution.value = [
        domElement.clientWidth * pixelRatio,
        domElement.clientHeight * pixelRatio,
      ];

      waterMaterialRef.current.uniforms.uCameraNear.value = camera.near;
      waterMaterialRef.current.uniforms.uCameraFar.value = camera.far;
      waterMaterialRef.current.uniforms.uTime.value = clock.getElapsedTime();
    }
  });
  return (
    <mesh {...props} ref={waterRef}>
      <planeGeometry args={[15, 32, 22, 22]} />
      <waterShaderMaterial
        ref={waterMaterialRef}
        uColor={waterColor}
        uOpacity={waterOpacity}
        uSpeed={speed}
        uRepeat={repeat}
        uNoiseType={noiseType}
        uFoam={foam}
        uFoamTop={foamTop}
        uMaxDepth={maxDepth}
        transparent
        tonemaped={false}
      />
    </mesh>
  );
};

export default Water;
