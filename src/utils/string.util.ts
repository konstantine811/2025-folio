export function capitalizeFirstLetter(str: string) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export const normalizeStr = (str: string) =>
  str
    .replace(/['’ʼ`´]/g, "") // видаляє: ' ’ ʼ ` ´
    .trim()
    .toLowerCase();
