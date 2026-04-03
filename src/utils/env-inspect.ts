const devHostnames = new Set(["localhost", "127.0.0.1", "[::1]"]);

export const isLocalhost =
  typeof window !== "undefined" && devHostnames.has(window.location.hostname);
