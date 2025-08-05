import { create } from "zustand";

export enum SliderDirection {
  start = "start",
  next = "next",
  prev = "prev",
  current = "current",
}

interface ThreeSliderState {
  curSlide: number;
  direction: SliderDirection;
  items: {
    image: string;
    short: string;
    title: string;
    description: string;
    color: string;
  }[];
  nextSlide: () => void;
  prevSlide: () => void;
}

export const useThreeSliderStore = create<ThreeSliderState>((set) => ({
  curSlide: 0,
  direction: SliderDirection.start,
  items: [
    {
      image:
        "/images/shader-slider/Default_authentic_futuristic_cottage_with_garden_outside_0.jpg",
      short: "PH",
      title: "Relax",
      description: "Enjoy your peace of mind.",
      color: "#201d24",
    },
    {
      image:
        "/images/shader-slider/Default_balinese_futuristic_villa_with_garden_outside_jungle_0.jpg",
      short: "TK",
      title: "Breath",
      color: "#263a27",
      description: "Feel the nature surrounding you.",
    },
    {
      image:
        "/images/shader-slider/Default_desert_arabic_futuristic_villa_with_garden_oasis_outsi_0.jpg",
      short: "OZ",
      title: "Travel",
      color: "#8b6d40",
      description: "Brave the unknown.",
    },
    {
      image:
        "/images/shader-slider/Default_scandinavian_ice_futuristic_villa_with_garden_outside_0.jpg",
      short: "SK",
      title: "Calm",
      color: "#72a3ca",
      description: "Free your mind.",
    },
    {
      image:
        "/images/shader-slider/Default_traditional_japanese_futuristic_villa_with_garden_outs_0.jpg",
      short: "AU",
      title: "Feel",
      color: "#c67e90",
      description: "Emotions and experiences.",
    },
  ],
  nextSlide: () => {
    return set((state) => ({
      curSlide: (state.curSlide + 1) % state.items.length,
      direction: SliderDirection.next,
    }));
  },
  prevSlide: () => {
    return set((state) => ({
      curSlide: (state.curSlide - 1 + state.items.length) % state.items.length,
      direction: SliderDirection.prev,
    }));
  },
}));
