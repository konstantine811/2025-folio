import { IThemeColors } from "@config/theme-colors.config";

export const getConicGradientFromTheme = (
  themeColors: Pick<IThemeColors, keyof IThemeColors>
) => {
  const colors = Object.values(themeColors);
  const segment = 100 / colors.length;

  const gradient = colors
    .map((color, i) => {
      const start = (i * segment).toFixed(2);
      const end = ((i + 1) * segment).toFixed(2);
      return `${color} ${start}% ${end}%`;
    })
    .join(", ");

  return `conic-gradient(${gradient})`;
};

export const setTheme = (themeColors: IThemeColors) => {
  Object.entries(themeColors).forEach(([key, value]) => {
    document.documentElement.style.setProperty(`--${key}`, value);
  });
};
