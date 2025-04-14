export const ThemePalette: IThemePalette = {
  dark: {
    primary: "#000000",
    secondary: "#1a1a1a",
    tertiary: "#333333",
    main: "#4d4d4d",
    accent: "#666666",
    background: "#808080",
    text: "#999999",
    border: "#b3b3b3",
    shadow: "#cccccc",
    highlight: "#e6e6e6",
    link: "#ffffff",
  },
  green: {
    primary: "#004d00",
    secondary: "#007300",
    tertiary: "#009900",
    main: "#00cc00",
    accent: "#33ff33",
    background: "#66ff66",
    text: "#99ff99",
    border: "#ccffcc",
    shadow: "#e6ffe6",
    highlight: "#f2fff2",
    link: "#ffffff",
  },
  blue: {
    primary: "#0078d4",
    secondary: "#2b88d8",
    tertiary: "#71afe5",
    main: "#0000cc",
    accent: "#3333ff",
    background: "#6666ff",
    text: "#9999ff",
    border: "#ccccff",
    shadow: "#e6e6ff",
    highlight: "#f2f2ff",
    link: "#ffffff",
  },
  light: {
    primary: "#ffffff",
    secondary: "#f2f2f2",
    tertiary: "#e6e6e6",
    main: "#d9d9d9",
    accent: "#cccccc",
    background: "#b3b3b3",
    text: "#999999",
    border: "#808080",
    shadow: "#666666",
    highlight: "#4d4d4d",
    link: "#000000",
  },
};

export enum ThemeType {
  DARK = "dark",
  LIGHT = "light",
  GREEN = "green",
  BLUE = "blue",
}

export type IThemePalette = {
  [keyof in ThemeType]: IThemeColors;
};

export interface IThemeColors {
  primary: string;
  secondary: string;
  tertiary: string;
  main: string;
  accent: string;
  background: string;
  text: string;
  border: string;
  shadow: string;
  highlight: string;
  link: string;
}
