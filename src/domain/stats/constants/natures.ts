import type { Nature } from "../types/StatTypes";

export const NATURES: Nature[] = [
  // Neutral
  {
    name: "Hardy",
    increasedStat: null,
    decreasedStat: null,
  },
  {
    name: "Docile",
    increasedStat: null,
    decreasedStat: null,
  },
  {
    name: "Bashful",
    increasedStat: null,
    decreasedStat: null,
  },
  {
    name: "Quirky",
    increasedStat: null,
    decreasedStat: null,
  },
  {
    name: "Serious",
    increasedStat: null,
    decreasedStat: null,
  },

  // Attack
  {
    name: "Lonely",
    increasedStat: "attack",
    decreasedStat: "defense",
  },
  {
    name: "Adamant",
    increasedStat: "attack",
    decreasedStat: "special-attack",
  },
  {
    name: "Naughty",
    increasedStat: "attack",
    decreasedStat: "special-defense",
  },
  {
    name: "Brave",
    increasedStat: "attack",
    decreasedStat: "speed",
  },

  // Defense
  {
    name: "Bold",
    increasedStat: "defense",
    decreasedStat: "attack",
  },
  {
    name: "Impish",
    increasedStat: "defense",
    decreasedStat: "special-attack",
  },
  {
    name: "Lax",
    increasedStat: "defense",
    decreasedStat: "special-defense",
  },
  {
    name: "Relaxed",
    increasedStat: "defense",
    decreasedStat: "speed",
  },

  // Special Attack
  {
    name: "Modest",
    increasedStat: "special-attack",
    decreasedStat: "attack",
  },
  {
    name: "Mild",
    increasedStat: "special-attack",
    decreasedStat: "defense",
  },
  {
    name: "Rash",
    increasedStat: "special-attack",
    decreasedStat: "special-defense",
  },
  {
    name: "Quiet",
    increasedStat: "special-attack",
    decreasedStat: "speed",
  },

  // Special Defense
  {
    name: "Calm",
    increasedStat: "special-defense",
    decreasedStat: "attack",
  },
  {
    name: "Gentle",
    increasedStat: "special-defense",
    decreasedStat: "defense",
  },
  {
    name: "Careful",
    increasedStat: "special-defense",
    decreasedStat: "special-attack",
  },
  {
    name: "Sassy",
    increasedStat: "special-defense",
    decreasedStat: "speed",
  },

  // Speed
  {
    name: "Timid",
    increasedStat: "speed",
    decreasedStat: "attack",
  },
  {
    name: "Hasty",
    increasedStat: "speed",
    decreasedStat: "defense",
  },
  {
    name: "Jolly",
    increasedStat: "speed",
    decreasedStat: "special-attack",
  },
  {
    name: "Naive",
    increasedStat: "speed",
    decreasedStat: "special-defense",
  },
];
