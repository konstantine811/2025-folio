/** WebGPU-only exports missing from older @types/three snapshots. */
declare module "three/webgpu" {
  export class IndirectStorageBufferAttribute {
    readonly isIndirectStorageBufferAttribute: true;
    array: ArrayLike<number>;
    count: number;
    itemSize: number;
    constructor(array: ArrayLike<number>, itemSize: number);
  }
}
