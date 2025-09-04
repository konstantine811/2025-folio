import { DreiShaderMaterial } from "@/path/to/image-slider"; // шляхи можуть відрізнятися
import { Object3DNode } from "@react-three/fiber";

declare module "@react-three/fiber" {
  interface ThreeElements {
    imageShaderMaterial: Object3DNode<
      typeof DreiShaderMaterial,
      typeof DreiShaderMaterial
    >;
    waterShaderMaterial: Object3DNode<
      typeof DreiShaderMaterial,
      typeof DreiShaderMaterial
    >;
    screenTransitionMaterial: Object3DNode<
      typeof DreiShaderMaterial,
      typeof DreiShaderMaterial
    >;
    trailMaterial: Object3DNode<
      typeof DreiShaderMaterial,
      typeof DreiShaderMaterial
    >;
    meshLineMaterial: Object3DNode<
      typeof DreiShaderMaterial,
      typeof DreiShaderMaterial
    >;
    particlesMaterial: Object3DNode<
      typeof ParticlesMaterial,
      typeof ParticlesMaterial
    >;
    gradientShaderMaterial: Object3DNode<
      typeof GradientShaderMaterial,
      typeof GradientShaderMaterial
    >;
    gradientMaterial: Object3DNode<
      typeof GradientMaterial,
      typeof GradientMaterial
    >;
    grassGradientMaterial: ReactThreeFiber.Object3DNode<
      ShaderMaterial & {
        baseColor?: Color;
        colorA?: Color;
        colorB?: Color;
        randomK?: number;
        specularColor?: Color;
        specularAmount?: number;
        specularPower?: number;
        bottomColor?: Color;
        bottomHeight?: number;
        bottomSoftness?: number;
        edgeStrength?: number;
        edgePower?: number;
        emissionStrength?: number;
        transparency?: number;
        time?: number;
        noiseScale?: number;
        uWindAmp?: number;
        uWindFreq?: number;
        uWindDir?: Vector2;
      },
      typeof ShaderMaterial
    >;
    grassGradientMaterialSecond: Object3DNode<
      typeof GradientMaterial,
      typeof GradientMaterial
    >;
    meshStandardNodeMaterial: Object3DNode<
      typeof MeshStandardNodeMaterial,
      typeof MeshStandardNodeMaterial
    >;
    meshBasicNodeMaterial: Object3DNode<
      typeof MeshBasicNodeMaterial,
      typeof MeshBasicNodeMaterial
    >;
    // Додайте інші шейдерні матеріали, якщо потрібно
  }
}
