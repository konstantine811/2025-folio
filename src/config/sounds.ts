import { Howl } from "howler";

function getEfxPath(name: string): string {
  return `/sound/ui-efx/${name}.mp3`;
}
// sounds.ts
export const buttonHoverSound = new Howl({
  src: [getEfxPath("button-active-3")],
  volume: 0.5,
});

export const buttonHoverOutSound = new Howl({
  src: [getEfxPath("button-active-3-out")],
  volume: 0.3,
});

export const buttonHoverSound2 = new Howl({
  src: [getEfxPath("button-hover")],
  volume: 1.0,
  sprite: {
    first: [0, 1000],
  },
});

export const buttonClickSound = new Howl({
  src: [getEfxPath("click")],
  sprite: {
    first: [300, 2000],
  },
  volume: 0.7,
});

export const buttonClickSound2 = new Howl({
  src: [getEfxPath("click-2")],
  volume: 1.0,
  sprite: {
    first: [0, 2000],
  },
});

export const rustleSound = new Howl({
  src: [getEfxPath("rustle")],
  volume: 1.0,
  sprite: {
    rustle: [1300, 2000],
  },
});

export const selectSound = new Howl({
  src: [getEfxPath("select")],
  volume: 0.8,
  sprite: {
    first: [0, 1000],
    second: [1600, 2000],
    third: [3300, 4000],
  },
});

export const selectSound_2 = new Howl({
  src: [getEfxPath("select-2")],
  volume: 0.5,
  sprite: {
    first: [0, 1600],
    second: [3600, 900],
    third: [5700, 1500],
  },
});

export const selectClickSound = new Howl({
  src: [getEfxPath("select-2")],
  volume: 1.0,
  sprite: {
    first: [0, 1600],
  },
});

export const selectedSound = new Howl({
  src: [getEfxPath("selected")],
  volume: 1.0,
  sprite: {
    first: [0, 1300],
    second: [2800, 2000],
  },
});

export const shinySound = new Howl({
  src: [getEfxPath("shiny")],
  volume: 0.3,
  sprite: {
    first: [0, 3000],
    second: [5000, 9000],
    third: [9500, 13000],
  },
});

export const riserSound = new Howl({
  src: [getEfxPath("riser-2")],
  volume: 0.5,
  sprite: {
    first: [6008, 7000],
    second: [7000, 10000],
  },
});
