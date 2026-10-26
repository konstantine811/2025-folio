export function resourceName(path: string) {
  const clean = path.split(/[?#]/, 1)[0];
  let decoded = clean;
  try { decoded = decodeURIComponent(clean); } catch { /* Keep literal malformed URI names. */ }
  return decoded.replace(/\\/g, '/').split('/').pop() ?? decoded;
}

export function findCompanion<T extends { name: string }>(path: string, files: T[]): T | undefined {
  const name = resourceName(path);
  const exact = files.find(file => file.name === name);
  if (exact) return exact;
  const matches = files.filter(file => file.name.toLowerCase() === name.toLowerCase());
  return matches.length === 1 ? matches[0] : undefined;
}

export class MissingResourcesError extends Error {
  readonly resources: string[];
  readonly canSkipTextures: boolean;
  constructor(resources: Iterable<string>) {
    const names = [...new Set(resources)];
    super(`Не знайдено файли моделі: ${names.join(', ')}`);
    this.name = 'MissingResourcesError';
    this.resources = names;
    this.canSkipTextures = names.length > 0 && names.every(name => /\.(png|jpe?g|webp|tga|bmp|gif)$/i.test(name));
  }
}
