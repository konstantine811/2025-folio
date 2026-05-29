const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";

/** iOS (incl. iPadOS 13+, which reports as "MacIntel" with touch points). */
export const isIOS =
  /iP(hone|ad|od)/.test(ua) ||
  (typeof navigator !== "undefined" &&
    navigator.platform === "MacIntel" &&
    navigator.maxTouchPoints > 1);

/** Phones / tablets — memory-constrained GPUs that lose the WebGL context easily. */
export const isMobileDevice =
  typeof window !== "undefined" &&
  (isIOS ||
    /Android|Mobile|Silk|Kindle|BlackBerry|Opera Mini|IEMobile/i.test(ua) ||
    (typeof window.matchMedia === "function" &&
      window.matchMedia("(pointer: coarse)").matches));

/** Cap devicePixelRatio to limit framebuffer memory on memory-constrained GPUs. */
export const getDprCap = (): [number, number] =>
  isMobileDevice ? [1, 1.5] : [1, 2];

/**
 * Skip very large GPU assets (e.g. 8K textures) on memory-constrained devices.
 * 8K RGBA textures cost ~256 MB of VRAM each and reliably crash mobile WebGL.
 */
export const prefersLightweightTextures = isMobileDevice;
