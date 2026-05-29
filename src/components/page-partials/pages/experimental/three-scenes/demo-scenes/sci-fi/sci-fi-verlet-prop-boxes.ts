import type { ResolvedCableProxyBox } from "./character/sci-fi-cable-proxy-limbs";

export type SciFiVerletPropBoxProvider = () => readonly ResolvedCableProxyBox[];

const providers = new Set<SciFiVerletPropBoxProvider>();

/** Register a world-space box provider for Verlet helmet cables (table, chair, …). */
export function registerSciFiVerletPropBoxProvider(provider: SciFiVerletPropBoxProvider) {
  providers.add(provider);
  return () => {
    providers.delete(provider);
  };
}

/** Appends prop boxes — does not clear `out` (body proxies stay intact). */
export function appendSciFiVerletPropBoxes(
  out: ResolvedCableProxyBox[],
): ResolvedCableProxyBox[] {
  for (const provider of providers) {
    out.push(...provider());
  }
  return out;
}
