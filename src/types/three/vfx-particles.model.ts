export enum SpawnMode {
  time = "time",
  burst = "burst",
}

export enum RenderMode {
  billboard = "billboard",
  mesh = "mesh",
}

export type Triplet = [number, number, number];
export type Duplet = [number, number];

export interface VFXSettings {
  nbParticles: number;
  duration: number;
  spawnMode: SpawnMode;
  loop: boolean;
  delay: number;
  colorStart: string[];
  colorEnd: string[];
  particlesLifetime: Duplet;
  speed: Duplet;
  size: Duplet;
  startPositionMin: Triplet;
  startPositionMax: Triplet;
  startRotationMin: Triplet;
  startRotationMax: Triplet;
  rotationSpeedMin: Triplet;
  rotationSpeedMax: Triplet;
  directionMin: Triplet;
  directionMax: Triplet;
  intensity: number;
  renderMode: RenderMode;
}

export interface VFXEmitterSettings {
  position: Triplet;
  direction: Triplet;
  scale: Triplet;
  rotation: Triplet;
  rotationSpeed: Triplet;
  lifeTime: Duplet;
  colorStart: string;
  colorEnd: string;
  speed: number;
}
