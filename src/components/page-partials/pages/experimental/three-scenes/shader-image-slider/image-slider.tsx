import {
  SliderDirection,
  useThreeSliderStore,
} from "@/storage/three-slider/useSlider";
import { useSpring } from "@react-spring/web";
import { shaderMaterial, useTexture } from "@react-three/drei";
import { extend, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import {
  MathUtils,
  MirroredRepeatWrapping,
  ShaderMaterial,
  Texture,
} from "three";

const PUSH_FORCE = 1.4;

const vertexShader = /*glsl */ `
  varying vec2 vUv;
  varying float vPushed;
  uniform vec2 uMousePosition;
  uniform float uPushForce;

  void main() {
    vUv = uv;
    vec2 centeredUv = (vUv - 0.5) * 2.0;
    float pushed = length(centeredUv - uMousePosition);
    pushed = 1.0 - smoothstep(0.0, 1.5, pushed);
    pushed = -uPushForce * pushed;
    vPushed = pushed;
    vec3 dispPosition = position;
    dispPosition.z = pushed;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(dispPosition, 1.0);
  }
`;

const fragmentShader = /*glsl */ `

  uniform sampler2D uTexture;
  uniform sampler2D uPrevTexture;
  uniform float uDirection;
  uniform float uProgression;
  uniform sampler2D uDispTexture;
  varying vec2 vUv;
  varying float vPushed;

   float rand(vec2 n) {
     return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
    }

    float noise(vec2 p){
        vec2 ip = floor(p);
        vec2 u = fract(p);
        u = u*u*(3.0-2.0*u);

        float res = mix(
            mix(rand(ip),rand(ip+vec2(1.0,0.0)),u.x),
            mix(rand(ip+vec2(0.0,1.0)),rand(ip+vec2(1.0,1.0)),u.x),u.y);
        return res*res;
    }

    float sdRoundedBox( in vec2 p, in vec2 b, in vec4 r )
    {
        r.xy = (p.x>0.0)?r.xy : r.zw;
        r.x  = (p.y>0.0)?r.x  : r.y;
        vec2 q = abs(p)-b+r.x;
        return min(max(q.x,q.y),0.0) + length(max(q,0.0)) - r.x;
    }

  void main() {
    vec2 uv = vUv;
    float noiseFactor = 0.0;
    float dispTexture = texture2D(uDispTexture, uv).r;
    noiseFactor = dispTexture;
    vec2 distoredPosition = vec2(uv.x - float(uDirection) * (1.0 - uProgression) * noiseFactor, uv.y);
    float curTextureR = texture(uTexture, distoredPosition + vec2(vPushed * 0.062)).r;
    float curTextureG = texture(uTexture, distoredPosition + vec2(vPushed * 0.042)).g;
    float cutTextureB = texture(uTexture, distoredPosition + vec2(vPushed * -0.032)).b;
    float curTextureA = texture(uTexture, distoredPosition).a;
    vec4 curTexture = vec4(curTextureR, curTextureG, cutTextureB, curTextureA); 

    vec2 distoredPositionPrev = vec2(uv.x + float(uDirection) * uProgression * noiseFactor, uv.y);
    vec4 prevTexture = texture(uPrevTexture, distoredPositionPrev);

    vec4 finalTexture = mix(prevTexture, curTexture, uProgression);

    vec2 centeredUv = (uv - 0.5) * 2.0;
    float frame = sdRoundedBox(centeredUv, vec2(1.0), vec4(0.2, 0.0, 0.0, 0.2));
    frame = smoothstep(0.0, 0.002, -frame);
    finalTexture.a *= frame;
    gl_FragColor = finalTexture;
    
  }
`;

const ImageShaderMaterial = shaderMaterial(
  {
    uProgression: 1.0,
    uTexture: null as Texture | null,
    uPrevTexture: null as Texture | null,
    uDirection: 1,
    uPushForce: PUSH_FORCE,
    uMousePosition: [0, 0],
    uDispTexture: null,
  },
  vertexShader,
  fragmentShader
);

extend({ ImageShaderMaterial });

const ImageSlider = ({
  width = 3,
  height = 4,
  fillPercent = 0.75,
}: {
  width?: number;
  height?: number;
  fillPercent?: number;
}) => {
  const viewport = useThree((state) => state.viewport);
  const refMaterial = useRef<ShaderMaterial>(null!);
  let ratio = viewport.height / (height / fillPercent);
  if (viewport.width < viewport.height) {
    ratio = viewport.width / (width / fillPercent);
  }
  const [transition, setTransition] = useState(false);
  const dispTexture = useTexture(
    "/images/textures/TCom_Ice_Cracked_header.jpg"
  );
  const hovered = useRef(false);
  const { items, curSlide, direction } = useThreeSliderStore();
  const image = items[curSlide].image;
  const texture = useTexture(image);
  const [lastImage, setLastImage] = useState(image);
  const prevTexture = useTexture(lastImage);
  texture.wrapS =
    texture.wrapT =
    prevTexture.wrapS =
    prevTexture.wrapT =
      MirroredRepeatWrapping;

  const { uProgression } = useSpring({
    from: { uProgression: 0 },
    to: { uProgression: 1.0 },
    config: { mass: 2, tension: 50, friction: 20 },
  });

  useEffect(() => {
    const newImage = image;
    refMaterial.current.uniforms.uProgression.value = 0;
    uProgression.set(0.0);

    refMaterial.current.uniforms.uMousePosition.value = [
      direction === SliderDirection.prev ? -1 : 1,
      0,
    ];
    setTransition(true);
    const timeout = setTimeout(() => {
      setTransition(false);
    }, 1600);
    return () => {
      setLastImage(newImage);
      clearTimeout(timeout);
    };
  }, [image, direction, uProgression]);

  useFrame((state) => {
    const { pointer } = state;
    refMaterial.current.uniforms.uMousePosition.value = [
      MathUtils.lerp(
        refMaterial.current.uniforms.uMousePosition.value[0],
        transition
          ? (direction === SliderDirection.prev ? 1.0 : -1.0) *
              refMaterial.current.uniforms.uProgression.value
          : pointer.x,
        0.05
      ),
      MathUtils.lerp(
        refMaterial.current.uniforms.uMousePosition.value[1],
        transition
          ? -1.0 * refMaterial.current.uniforms.uProgression.value
          : pointer.y,
        0.05
      ),
    ];

    // refMaterial.current.uniforms.uProgression.value = MathUtils.lerp(
    //   refMaterial.current.uniforms.uProgression.value,
    //   1,
    //   0.05
    // );
    refMaterial.current.uniforms.uProgression.value = uProgression.get();

    refMaterial.current.uniforms.uPushForce.value = MathUtils.lerp(
      refMaterial.current.uniforms.uPushForce.value,
      transition
        ? -PUSH_FORCE *
            1.52 *
            Math.sin(refMaterial.current.uniforms.uProgression.value * 3.14)
        : hovered.current
        ? PUSH_FORCE
        : 0,
      0.05
    );
  });

  return (
    <mesh
      onPointerEnter={() => {
        hovered.current = true;
      }}
      onPointerLeave={() => {
        hovered.current = false;
      }}
    >
      <planeGeometry args={[width * ratio, height * ratio, 32, 32]} />
      <imageShaderMaterial
        ref={refMaterial}
        uTexture={texture}
        uPrevTexture={prevTexture}
        uDirection={direction === SliderDirection.next ? 1 : -1}
        uDispTexture={dispTexture}
        transparent
      />
    </mesh>
  );
};

useThreeSliderStore.getState().items.forEach((item) => {
  useTexture.preload(item.image);
});

useTexture.preload("/images/textures/TCom_Ice_Cracked_header.jpg");

export default ImageSlider;
