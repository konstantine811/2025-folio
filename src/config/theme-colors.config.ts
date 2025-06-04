export const ThemePalette: IThemePalette = {
  dark: {
    background: "#000000",
    border: "#b3b3b3",
    foreground: "#d9d9d9",
    card: "#1a1a1a",
    "card-foreground": "#d9d9d9",
    popover: "#000000",
    "popover-foreground": "#d9d9d9",
    primary: "#4a80e8",
    "primary-foreground": "#d9d9d9",
    secondary: "#e6e6e6",
    "secondary-foreground": "#666666",
    muted: "#1a1a1a",
    "muted-foreground": "#666666",
    accent: "#4a80e8",
    "accent-foreground": "#d9d9d9",
    destructive: "#ff3333",
    input: "#333333",
    ring: "#4a80e8",
  },

  light: {
    background: "#fbfcf8",
    border: "#808080",
    foreground: "#333333",
    card: "#e8e8e8",
    "card-foreground": "#333333",
    popover: "#fbfcf8",
    "popover-foreground": "#333333",
    primary: "#3f6ae0",
    "primary-foreground": "#ffffff",
    secondary: "#4d4d4d",
    "secondary-foreground": "#666666",
    muted: "#f2f2f2",
    "muted-foreground": "#666666",
    accent: "#3f6ae0",
    "accent-foreground": "#333333",
    destructive: "#cc0000",
    input: "#e6e6e6",
    ring: "#3f6ae0",
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

export const ThemeStaticPalette = {
  green: "#65e396",
  yellow: "#fffe00",
};

export type IThemePalette = {
  [keyof in ThemeType]: IThemeColors;
};

export interface IThemeColors {
  background: string;
  foreground: string;
  card: string;
  "card-foreground": string;
  popover: string;
  "popover-foreground": string;
  primary: string;
  "primary-foreground": string;
  secondary: string;
  "secondary-foreground": string;
  muted: string;
  "muted-foreground": string;
  accent: string;
  "accent-foreground": string;
  destructive: string;
  input: string;
  ring: string;
  border: string;
  sidebar?: string;
  "sidebar-foreground"?: string;
  chart1?: string;
  chart2?: string;
  chart3?: string;
  chart4?: string;
  chart5?: string;
}
