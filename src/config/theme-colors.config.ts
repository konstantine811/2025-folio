export const ThemePalette: IThemePalette = {
  dark: {
    background: "#000000",
    "background-alt": "#1a1a1a",
    surface: "#333333",
    border: "#b3b3b3",
    fg: "#ffffff",
    fgMuted: "#666666",
    accent: "#32ffce",
    highlight: "#e6e6e6",
    shadow: "#cccccc",
    link: "#ffffff",
    success: "#00cc66",
    error: "#ff3333",
    warning: "#ff9900",
  },
  light: {
    background: "#ffffff",
    "background-alt": "#f2f2f2",
    surface: "#e6e6e6",
    border: "#808080",
    fg: "#333333",
    fgMuted: "#666666",
    accent: "#3f6ae0",
    highlight: "#4d4d4d",
    shadow: "#999999",
    link: "#000000",
    success: "#00cc66",
    error: "#cc0000",
    warning: "#ff9900",
  },
  // green: {
  //   background: "#66ff66",
  //   "background-alt": "#33cc33",
  //   surface: "#00cc00",
  //   border: "#ccffcc",
  //   fg: "#003300",
  //   fgMuted: "#009900",
  //   accent: "#33ff33",
  //   highlight: "#f2fff2",
  //   shadow: "#e6ffe6",
  //   link: "#004d00",
  //   success: "#00cc00",
  //   error: "#990000",
  //   warning: "#cc9900",
  // },
  // blue: {
  //   background: "#6666ff",
  //   "background-alt": "#2b88d8",
  //   surface: "#0000cc",
  //   border: "#ccccff",
  //   fg: "#000033",
  //   fgMuted: "#666699",
  //   accent: "#3333ff",
  //   highlight: "#f2f2ff",
  //   shadow: "#e6e6ff",
  //   link: "#0078d4",
  //   success: "#00ccff",
  //   error: "#ff3333",
  //   warning: "#ffcc00",
  // },
};

export enum ThemeType {
  DARK = "dark",
  LIGHT = "light",
  // GREEN = "green",
  // BLUE = "blue",
}

export type IThemePalette = {
  [keyof in ThemeType]: IThemeColors;
};

export interface IThemeColors {
  background: string;
  "background-alt": string;
  surface: string;
  border: string;
  fg: string;
  fgMuted: string;
  accent: string;
  highlight: string;
  shadow: string;
  link: string;
  success: string;
  error: string;
  warning: string;
}
