import { atom } from "jotai";

export const screenAtom = atom("home");
export const cakeAtom = atom(-1);
export const isMobileAtom = atom(false);
export const transitionAtom = atom(true);

export const TRANSITION_DELAY = 0.8;
export const TRANSITION_DURATION = 3.2;
export const CAKE_TRANSITION_DURATION = 2.5;

export const cakes = [
  {
    name: "Choco Bunny",
    description: "A cute hot chocolate bunny.",
    model: "choco_bunny",
    scale: 0.32,
  },
  {
    name: "Cake Roll",
    description: "A delicious cake roll with strawberries.",
    model: "cake_roll",
    scale: 0.6,
  },
  {
    name: "Flan Quesillo",
    description: "A traditional Venezuelan dessert.",
    model: "flan_quesillo",
    scale: 0.92,
  },
];
