import { Howl } from "howler";

function getEfxPath(name: string, format = "mp3"): string {
  return `/sound/ui-efx/${name}.${format}`;
}

function getGameEfxPath(name: string, format = "mp3"): string {
  return `/sound/game-sfx/${name}.${format}`;
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

export const menuOpenSound = new Howl({
  volume: 0.05,
  src: [getEfxPath("menu-open-2", "wav")],
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
  volume: 0.3,
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
  volume: 0.1,
  sprite: {
    first: [6008, 1000],
    second: [7000, 3000],
  },
});

export const transitionSound = new Howl({
  src: [getEfxPath("transition", "wav")],
  volume: 0.1,
});

export const revealDarkSound = new Howl({
  src: [getEfxPath("reveal-dark", "wav")],
  volume: 1,
});

export const revealSound = new Howl({
  src: [getEfxPath("reveal", "wav")],
  volume: 1,
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

export const walkSound = new Howl({
  src: [getGameEfxPath("walk")],
  volume: 0.2,
  loop: true,
});

export const jumpSound = new Howl({
  src: [getGameEfxPath("jump")],
  volume: 0.5,
  loop: false,
  sprite: {
    first: [3000, 500],
  },
});

export const jumpLandSound = new Howl({
  src: [getGameEfxPath("jump_land")],
  volume: 0.6,
  loop: false,
  rate: 1.2,
  sprite: {
    first: [1894, 500],
  },
});

export const whooshHandSound = new Howl({
  src: [getGameEfxPath("whoosh_hand", "wav")],
  volume: 1,
  loop: false,
  rate: 0.8,
});

export const punchSound = new Howl({
  src: [getGameEfxPath("punch")],
  volume: 0.5,
  loop: false,
  rate: 1,
  sprite: {
    first: [0, 1000],
  },
});

export const keyboardTypingSound = new Howl({
  src: [getGameEfxPath("keyboard_typing", "wav")],
  volume: 1,
  loop: false,
  rate: 1,
});

export const atmospericSoundFirst = new Howl({
  src: ["/sound/game-sfx/music/mean_streats_phoenix_tail.mp3"],
  volume: 0.5,
  loop: true,
});

export const envSound = new Howl({
  src: ["/sound/music/ES_Intermission - Hanna Lindgren.mp3"],
  volume: 0.3,
  loop: true,
});
