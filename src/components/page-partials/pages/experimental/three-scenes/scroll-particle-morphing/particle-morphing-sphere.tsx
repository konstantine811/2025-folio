import { shaderMaterial } from "@react-three/drei";
import { extend, useFrame, useThree } from "@react-three/fiber";
import {
  Vector2,
  Float32BufferAttribute,
  BufferGeometry,
  SphereGeometry,
  ShaderMaterial,
  Color,
  Texture,
} from "three";
import { useMemo, useRef } from "react";
import { useRaycastGeometryStore } from "@/components/common/three/raycast-geometry/storage/raycast-storage";
import { useThemeStore } from "@/storage/themeStore";
import { ThemePalette } from "@/config/theme-colors.config";
import simplexNoise3dShader from "../particle-morphing/shaders/simplexNoise3d.glsl?raw";

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(window.devicePixelRatio, 2),
};

const vertexShader = /* glsl */ `
    ${simplexNoise3dShader}
    uniform vec2 uResolution;
    uniform float uSize;
    uniform float uProgress;
    attribute vec3 aPositionTarget;
    varying vec3 vColor;
    attribute float aIntensity;
    attribute float aAngle;
    attribute float aSize;
    uniform vec3 uColorA;
    uniform vec3 uColorB;
    varying vec2 vScreenUv;
    uniform sampler2D uDisplacementTexture;

    uniform float uTime;
    uniform float uJitterAmp;
    uniform float uJitterFreq;
    attribute vec3 aRandom;
    void main()
    {
       
        // Mixed position
        float noiseOrigin = snoise(position * 0.2);
        float noiseTarget = snoise(aPositionTarget * 0.2);
        float noise = mix(noiseOrigin, noiseTarget, uProgress);
        noise = smoothstep(-1.0, 1.0, noiseOrigin);

        float duration = 0.8;
        float delay = (1.0 - duration) * noise;
        float end = delay + duration;
        float progress = smoothstep(delay, end, uProgress);
        // Varyings
        vColor = mix(uColorA, uColorB, noise);
        vec3 mixedPosition = mix(position, aPositionTarget, progress);

        float t = uTime * uJitterFreq;

        // м'яке тремтіння через шум (стабільніше ніж "рандомні" стрибки)
        float n = snoise(mixedPosition * 10.1 + vec3(t * 0.01));
        float wobble = sin(t + n * 6.2831); // 2π

        vec3 jitter = aRandom * uJitterAmp * wobble;


        mixedPosition += jitter ;
     

        // Final position
        vec4 modelPosition = modelMatrix * vec4(mixedPosition, 1.0);
        vec4 viewPosition = viewMatrix * modelPosition;
        vec4 projectedPosition = projectionMatrix * viewPosition;
        gl_Position = projectedPosition;

        vec4 clipPosition  = projectionMatrix * viewPosition;

        // NDC -> 0..1
        vec2 ndc = clipPosition.xy / clipPosition.w;
        vScreenUv = ndc * 0.5 + 0.5;
      
        // семпл по екрану
        vec2 texUv = vec2(vScreenUv.x, vScreenUv.y);
        float displacementIntensity = texture2D(uDisplacementTexture, texUv).r;
        displacementIntensity = smoothstep(0.1, 1.0, displacementIntensity);
        vec3 displacement = vec3(sin(aAngle), cos(aAngle), 0.0);
        displacement = normalize(displacement);
        displacement *= displacementIntensity;
        displacement *= 0.8;
        displacement *= aIntensity;
        mixedPosition += displacement;
      
        // фінальна позиція
        modelPosition = modelMatrix * vec4(mixedPosition, 1.0);
        viewPosition  = viewMatrix * modelPosition;
        gl_Position   = projectionMatrix * viewPosition;

        // Point size
        gl_PointSize = aSize *uSize * uResolution.y;
        gl_PointSize *= (1.0 / - viewPosition.z);
    }`;

const fragmentShader = /* glsl */ `
    varying vec3 vColor;
    void main()
        {
            vec2 uv = gl_PointCoord;
            float distanceToCenter = length(uv - 0.5);
            // Збільшуємо альфа для кращої видимості на білому фоні
            float alpha = 0.3 / (distanceToCenter + 0.1) - 0.5;
            alpha = clamp(alpha, 0.0, 1.0);
            gl_FragColor = vec4(vColor, alpha);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
        }
    `;

const ShaderCustomMaterial = shaderMaterial(
  {
    uSize: 0.3, // Тимчасово збільшуємо для тесту
    uResolution: new Vector2(
      sizes.width * sizes.pixelRatio,
      sizes.height * sizes.pixelRatio
    ),
    depthWrite: false,
    uDisplacementTexture: null as Texture | null,
    uProgress: 0,

    uTime: 0,
    uJitterAmp: 1.05,
    uJitterFreq: 10.0,
    uColorA: new Color("#00c3ff"),
    uColorB: new Color("#ff8a00"),
  },
  vertexShader,
  fragmentShader
);

extend({ ShaderCustomMaterial });

// Компонент для сфери, який рендериться одразу
const ParticleMorphingSphere = () => {
  const sphereGeometry = useMemo(() => new SphereGeometry(40, 64, 64), []);
  
  const initialGeometry = useMemo(() => {
    const geom = sphereGeometry.clone();
    const spherePos = sphereGeometry.attributes.position;
    const sphereCount = spherePos.count;
    
    const spherePositions: Float32BufferAttribute[] = [];
    const originalArray = spherePos.array;
    const newArray = new Float32Array(sphereCount * 3);
    
    for (let i = 0; i < sphereCount; i++) {
      const i3 = i * 3;
      newArray[i3] = originalArray[i3 + 0];
      newArray[i3 + 1] = originalArray[i3 + 1];
      newArray[i3 + 2] = originalArray[i3 + 2];
    }
    spherePositions.push(new Float32BufferAttribute(newArray, 3));
    
    const randomArray = new Float32Array(sphereCount * 3);
    const sizesArray = new Float32Array(sphereCount);
    const intensities = new Float32Array(sphereCount);
    const angles = new Float32Array(sphereCount);
    
    for (let i = 0; i < sphereCount; i++) {
      const i3 = i * 3;
      randomArray[i3 + 0] = Math.random() * 2 - 1;
      randomArray[i3 + 1] = Math.random() * 2 - 1;
      randomArray[i3 + 2] = Math.random() * 2 - 1;
      sizesArray[i] = Math.random();
      intensities[i] = Math.random() + 1.5;
      angles[i] = Math.random() * Math.PI * 2;
    }

    geom.setIndex(null);
    geom.deleteAttribute("normal");
    geom.setAttribute(
      "aRandom",
      new Float32BufferAttribute(randomArray, 3)
    );
    geom.setAttribute(
      "aSize",
      new Float32BufferAttribute(sizesArray, 1)
    );
    geom.setAttribute(
      "aIntensity",
      new Float32BufferAttribute(intensities, 1)
    );
    geom.setAttribute(
      "aAngle",
      new Float32BufferAttribute(angles, 1)
    );
    
    if (spherePositions.length > 0) {
      geom.setAttribute("position", spherePositions[0]);
      geom.setAttribute(
        "aPositionTarget",
        spherePositions[0]
      );
    }
    
    return geom;
  }, [sphereGeometry]);
  
  const geometryRef = useRef<BufferGeometry>(initialGeometry);
  const theme = useThemeStore((state) => state.selectedTheme);
  const shaderCustomMaterialRef = useRef<ShaderMaterial>(null);
  const displacementTexture = useRaycastGeometryStore(
    (s) => s.displacementTexture
  );
  const { gl } = useThree();

  useFrame((state) => {
    const mat = shaderCustomMaterialRef.current;
    if (!mat) return;
    mat.uniforms.uTime.value = state.clock.elapsedTime;
    mat.uniforms.uProgress.value = 0; // Сфера завжди показується з progress = 0
    
    // Оновлюємо uResolution
    const pixelRatio = gl.getPixelRatio();
    mat.uniforms.uResolution.value.set(
      gl.domElement.clientWidth * pixelRatio,
      gl.domElement.clientHeight * pixelRatio
    );
  });


  return (
    <>
    <points
      frustumCulled={false}
      geometry={geometryRef.current}
    //   scale={isMdSize ? 9 : 18}
    >
      <shaderCustomMaterial
        ref={shaderCustomMaterialRef}
        uDisplacementTexture={displacementTexture}
        uColorA={ThemePalette[theme].accent}
        uColorB={ThemePalette[theme].foreground}
      />
    </points>
    <mesh>
      <sphereGeometry args={[20, 64, 64]} />
      <meshStandardMaterial color="white" wireframe />
    </mesh>
    </>
  );
};

export default ParticleMorphingSphere;

