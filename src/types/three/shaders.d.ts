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
    // Додайте інші шейдерні матеріали, якщо потрібно
  }
}
