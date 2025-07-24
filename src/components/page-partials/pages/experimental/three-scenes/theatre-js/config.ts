export enum Screens {
  Intro = "Intro",
  Home = "Home",
  Castle = "Castle",
  Windmill = "Windmill",
}

export const transitions: Screen = {
  [Screens.Home]: [0, 6],
  [Screens.Castle]: [9, 13],
  [Screens.Windmill]: [14, 17],
};

export type Screen = { [key in Screens]?: [number, number] };
