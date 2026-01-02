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
  preload: false,
});

export const buttonHoverOutSound = new Howl({
  src: [getEfxPath("button-active-3-out")],
  volume: 0.3,
  preload: false,
});

export const buttonHoverSound2 = new Howl({
  src: [getEfxPath("button-hover")],
  volume: 1.0,
  preload: false,
  sprite: {
    first: [0, 1000],
  },
});

export const buttonClickSound = new Howl({
  volume: 0.7,
  src: [getEfxPath("click")],
  preload: false,
  sprite: {
    first: [300, 1700],
  },
});

export const menuOpenSound = new Howl({
  volume: 0.05,
  src: [getEfxPath("menu-open-2", "wav")],
  preload: false,
});

export const buttonClickSound2 = new Howl({
  src: [getEfxPath("click-2")],
  volume: 1.0,
  preload: false,
  sprite: {
    first: [0, 2000],
  },
});

export const buttonClickSound3 = new Howl({
  src: [getEfxPath("click-3")],
  volume: 1.0,
  preload: false,
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
  preload: false,
  sprite: {
    rustle: [1300, 700],
  },
});

export const selectSound = new Howl({
  src: [getEfxPath("select")],
  volume: 0.3,
  preload: false,
  sprite: {
    first: [0, 1000],
    second: [1600, 400],
    third: [3300, 700],
  },
});

export const selectSound_2 = new Howl({
  src: [getEfxPath("select-2")],
  volume: 0.3,
  preload: false,
  sprite: {
    first: [0, 2000],
    second: [2885, 2000],
    third: [5800, 2000],
  },
});

export const selectSound_3 = new Howl({
  src: [getEfxPath("select-3")],
  volume: 0.1,
  preload: false,
  sprite: {
    first: [0, 2000],
    second: [3220, 2000],
    third: [6483, 2000],
  },
});

export const selectClickSound = new Howl({
  src: [getEfxPath("select-2")],
  volume: 1.0,
  preload: false,
  sprite: {
    first: [0, 1600],
  },
});

export const selectedSound = new Howl({
  src: [getEfxPath("selected")],
  volume: 0.1,
  preload: false,
  sprite: {
    first: [0, 1300],
    second: [3000, 2000],
  },
});

export const shinySound = new Howl({
  src: [getEfxPath("shiny")],
  volume: 0.3,
  preload: false,
  sprite: {
    first: [0, 3000],
    second: [5000, 4000],
    third: [9500, 4000],
  },
});

export const riserSound = new Howl({
  src: [getEfxPath("riser-2")],
  volume: 0.1,
  preload: false,
  sprite: {
    first: [6008, 1000],
    second: [7000, 3000],
  },
});

export const transitionSound = new Howl({
  src: [getEfxPath("transition", "wav")],
  volume: 0.1,
  preload: false,
});

export const revealDarkSound = new Howl({
  src: [getEfxPath("reveal-dark", "wav")],
  volume: 1,
  preload: false,
});

export const revealSound = new Howl({
  src: [getEfxPath("reveal", "wav")],
  volume: 1,
  preload: false,
});

export const whooshSound = new Howl({
  src: [getEfxPath("whoosh")],
  volume: 0.1,
  preload: false,
  sprite: {
    first: [0, 1000],
    second: [1800, 1000],
  },
});

export const checkInSound = new Howl({
  src: [getEfxPath("check-in")],
  volume: 1.0,
  preload: false,
});

export const checkOutSound = new Howl({
  src: [getEfxPath("check-out")],
  volume: 0.2,
  preload: false,
});

export const walkSound = new Howl({
  src: [getGameEfxPath("walk")],
  volume: 0.2,
  loop: true,
  preload: false,
});

export const jumpSound = new Howl({
  src: [getGameEfxPath("jump")],
  volume: 0.5,
  loop: false,
  preload: false,
  sprite: {
    first: [3000, 500],
  },
});

export const jumpLandSound = new Howl({
  src: [getGameEfxPath("jump_land")],
  volume: 0.6,
  loop: false,
  rate: 1.2,
  preload: false,
  sprite: {
    first: [1894, 500],
  },
});

export const whooshHandSound = new Howl({
  src: [getGameEfxPath("whoosh_hand", "wav")],
  volume: 1,
  loop: false,
  rate: 0.8,
  preload: false,
});

export const punchSound = new Howl({
  src: [getGameEfxPath("punch")],
  volume: 0.5,
  loop: false,
  rate: 1,
  preload: false,
  sprite: {
    first: [0, 1000],
  },
});

export const keyboardTypingSound = new Howl({
  src: [getGameEfxPath("keyboard_typing", "wav")],
  volume: 1,
  loop: false,
  rate: 1,
  preload: false,
});

export const atmospericSoundFirst = new Howl({
  src: ["/sound/game-sfx/music/mean_streats_phoenix_tail.mp3"],
  volume: 0.5,
  loop: true,
  preload: false,
});

export const envSound = new Howl({
  src: ["/sound/music/ES_Intermission - Hanna Lindgren.mp3"],
  volume: 0.3,
  loop: true,
  preload: false,
});

// Функція для асинхронного завантаження звуків після завантаження сторінки
export const preloadSounds = async (): Promise<void> => {
  const sounds = [
    buttonHoverSound,
    buttonHoverOutSound,
    buttonHoverSound2,
    buttonClickSound,
    menuOpenSound,
    buttonClickSound2,
    buttonClickSound3,
    rustleSound,
    selectSound,
    selectSound_2,
    selectSound_3,
    selectClickSound,
    selectedSound,
    shinySound,
    riserSound,
    transitionSound,
    revealDarkSound,
    revealSound,
    whooshSound,
    checkInSound,
    checkOutSound,
    walkSound,
    jumpSound,
    jumpLandSound,
    whooshHandSound,
    punchSound,
    keyboardTypingSound,
    atmospericSoundFirst,
    envSound,
  ];

  // Завантажуємо звуки асинхронно після завантаження сторінки
  return new Promise((resolve) => {
    // Використовуємо requestIdleCallback або setTimeout для завантаження після рендеру
    const loadSounds = () => {
      sounds.forEach((sound) => {
        // Перевіряємо, чи звук ще не завантажений (state() повертає 'unloaded' або 'loading')
        const state = sound.state();
        if (state === "unloaded") {
          sound.load();
        }
      });
      resolve();
    };

    if (typeof requestIdleCallback !== "undefined") {
      requestIdleCallback(loadSounds, { timeout: 2000 });
    } else {
      setTimeout(loadSounds, 100);
    }
  });
};
