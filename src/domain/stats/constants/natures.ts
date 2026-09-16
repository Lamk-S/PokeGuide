import type { Nature } from "../types/StatTypes";

export const NATURES: Nature[] = [
  { name: "Hardy", nameEs: "Fuerte", increasedStat: null, decreasedStat: null },
  { name: "Docile", nameEs: "Dócil", increasedStat: null, decreasedStat: null },
  {
    name: "Serious",
    nameEs: "Seria",
    increasedStat: null,
    decreasedStat: null,
  },
  {
    name: "Bashful",
    nameEs: "Tímida",
    increasedStat: null,
    decreasedStat: null,
  },
  { name: "Quirky", nameEs: "Rara", increasedStat: null, decreasedStat: null },

  {
    name: "Lonely",
    nameEs: "Huraña",
    increasedStat: "attack",
    decreasedStat: "defense",
  },
  {
    name: "Brave",
    nameEs: "Audaz",
    increasedStat: "attack",
    decreasedStat: "speed",
  },
  {
    name: "Adamant",
    nameEs: "Firme",
    increasedStat: "attack",
    decreasedStat: "special-attack",
  },
  {
    name: "Naughty",
    nameEs: "Pícara",
    increasedStat: "attack",
    decreasedStat: "special-defense",
  },

  {
    name: "Bold",
    nameEs: "Osada",
    increasedStat: "defense",
    decreasedStat: "attack",
  },
  {
    name: "Relaxed",
    nameEs: "Plácida",
    increasedStat: "defense",
    decreasedStat: "speed",
  },
  {
    name: "Impish",
    nameEs: "Agitada",
    increasedStat: "defense",
    decreasedStat: "special-attack",
  },
  {
    name: "Lax",
    nameEs: "Floja",
    increasedStat: "defense",
    decreasedStat: "special-defense",
  },

  {
    name: "Timid",
    nameEs: "Miedosa",
    increasedStat: "speed",
    decreasedStat: "attack",
  },
  {
    name: "Hasty",
    nameEs: "Activa",
    increasedStat: "speed",
    decreasedStat: "defense",
  },
  {
    name: "Jolly",
    nameEs: "Alegre",
    increasedStat: "speed",
    decreasedStat: "special-attack",
  },
  {
    name: "Naive",
    nameEs: "Ingenua",
    increasedStat: "speed",
    decreasedStat: "special-defense",
  },

  {
    name: "Modest",
    nameEs: "Modesta",
    increasedStat: "special-attack",
    decreasedStat: "attack",
  },
  {
    name: "Mild",
    nameEs: "Afable",
    increasedStat: "special-attack",
    decreasedStat: "defense",
  },
  {
    name: "Quiet",
    nameEs: "Mansa",
    increasedStat: "special-attack",
    decreasedStat: "speed",
  },
  {
    name: "Rash",
    nameEs: "Alocada",
    increasedStat: "special-attack",
    decreasedStat: "special-defense",
  },

  {
    name: "Calm",
    nameEs: "Serena",
    increasedStat: "special-defense",
    decreasedStat: "attack",
  },
  {
    name: "Gentle",
    nameEs: "Amable",
    increasedStat: "special-defense",
    decreasedStat: "defense",
  },
  {
    name: "Sassy",
    nameEs: "Grosera",
    increasedStat: "special-defense",
    decreasedStat: "speed",
  },
  {
    name: "Careful",
    nameEs: "Cauta",
    increasedStat: "special-defense",
    decreasedStat: "special-attack",
  },
];
