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
  volume: 0.7,
  src: [getEfxPath("click")],
  sprite: {
    first: [300, 1700],
  },
});

export const buttonClickSound2 = new Howl({
  src: [getEfxPath("click-2")],
  volume: 1.0,
  sprite: {
    first: [0, 2000],
  },
});

export const buttonClickSound3 = new Howl({
  src: [getEfxPath("click-3")],
  volume: 1.0,
  sprite: {
    first: [0, 300],
    second: [637, 300],
    third: [1451, 300],
    fourth: [2289, 300],
    fifth: [3054, 400],
    sixth: [3928, 400],
    seventh: [4778, 400],
  },
});

export const rustleSound = new Howl({
  src: [getEfxPath("rustle")],
  volume: 1.0,
  sprite: {
    rustle: [1300, 700],
  },
});

export const selectSound = new Howl({
  src: [getEfxPath("select")],
  volume: 0.3,
  sprite: {
    first: [0, 1000],
    second: [1600, 400],
    third: [3300, 700],
  },
});

export const selectSound_2 = new Howl({
  src: [getEfxPath("select-2")],
  volume: 0.1,
  sprite: {
    first: [0, 2000],
    second: [2885, 2000],
    third: [5800, 2000],
  },
});

export const selectSound_3 = new Howl({
  src: [getEfxPath("select-3")],
  volume: 0.1,
  sprite: {
    first: [0, 2000],
    second: [3220, 2000],
    third: [6483, 2000],
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
  volume: 0.1,
  sprite: {
    first: [0, 1300],
    second: [3000, 2000],
  },
});

export const shinySound = new Howl({
  src: [getEfxPath("shiny")],
  volume: 0.3,
  sprite: {
    first: [0, 3000],
    second: [5000, 4000],
    third: [9500, 4000],
  },
});

export const riserSound = new Howl({
  src: [getEfxPath("riser-2")],
  volume: 0.5,
  sprite: {
    first: [6008, 1000],
    second: [7000, 3000],
  },
});

export const whooshSound = new Howl({
  src: [getEfxPath("whoosh")],
  volume: 0.1,
  sprite: {
    first: [0, 1000],
    second: [1800, 1000],
  },
});

export const checkInSound = new Howl({
  src: [getEfxPath("check-in")],
  volume: 1.0,
});

export const checkOutSound = new Howl({
  src: [getEfxPath("check-out")],
  volume: 0.2,
});
