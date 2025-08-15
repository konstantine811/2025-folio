export enum SpawnMode {
  time = "time",
  burst = "burst",
}

export interface VFXSettings {
  nbParticles?: number;
  duration?: number;
  spawnMode?: SpawnMode;
  loop?: boolean;
  delay?: number;
}
