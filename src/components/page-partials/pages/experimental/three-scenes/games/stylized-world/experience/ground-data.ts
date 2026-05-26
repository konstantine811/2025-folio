import * as THREE from "three";

/** World half-extent (meters) captured by the orthographic ground-data camera. */
export const GROUND_DATA_HALF_SIZE = 16;
export const GROUND_DATA_RESOLUTION = 512;

/**
 * Top-down render target for wheel tracks — sampled by grass to flatten blades.
 * Separate scene + orthographic camera, rendered every frame.
 */
export class GroundData {
  readonly scene = new THREE.Scene();
  readonly camera: THREE.OrthographicCamera;
  readonly renderTarget: THREE.WebGLRenderTarget;
  readonly halfSize: number;

  constructor(
    resolution = GROUND_DATA_RESOLUTION,
    halfSize = GROUND_DATA_HALF_SIZE,
  ) {
    this.halfSize = halfSize;

    this.camera = new THREE.OrthographicCamera(
      -halfSize,
      halfSize,
      halfSize,
      -halfSize,
      0.1,
      200,
    );
    this.camera.position.y = 50;
    this.camera.rotation.x = -Math.PI / 2;
    this.camera.updateMatrixWorld();

    this.renderTarget = new THREE.WebGLRenderTarget(resolution, resolution, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
      format: THREE.RGBAFormat,
      type: THREE.UnsignedByteType,
      depthBuffer: false,
    });
    this.renderTarget.texture.name = "groundDataTracks";
    this.renderTarget.texture.colorSpace = THREE.NoColorSpace;
  }

  update(renderer: THREE.WebGLRenderer, centerX: number, centerZ: number) {
    this.camera.position.set(centerX, 50, centerZ);
    this.camera.updateMatrixWorld();

    const clearAlpha = renderer.getClearAlpha();
    const prevTarget = renderer.getRenderTarget();

    renderer.setClearAlpha(0);
    renderer.setClearColor(0x000000, 0);
    renderer.setRenderTarget(this.renderTarget);
    renderer.clear();
    renderer.render(this.scene, this.camera);
    renderer.setRenderTarget(prevTarget);
    renderer.setClearAlpha(clearAlpha);
  }

  get texture() {
    return this.renderTarget.texture;
  }

  dispose() {
    this.renderTarget.dispose();
  }
}

export type GrassGroundDataBinding = {
  texture: THREE.Texture | null;
  centerX: number;
  centerZ: number;
  halfSize: number;
};

export const DEFAULT_GRASS_GROUND_DATA_BINDING: GrassGroundDataBinding = {
  texture: null,
  centerX: 0,
  centerZ: 0,
  halfSize: GROUND_DATA_HALF_SIZE,
};
