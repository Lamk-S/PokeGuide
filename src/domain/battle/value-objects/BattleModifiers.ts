export const Weather = {
  none: { id: "none", label: "None", labelEs: "Ninguno", smogon: undefined },
  sun: { id: "sun", label: "Sun", labelEs: "Sol", smogon: "Sun" },
  rain: { id: "rain", label: "Rain", labelEs: "Lluvia", smogon: "Rain" },
  sand: {
    id: "sand",
    label: "Sand",
    labelEs: "Tormenta arena",
    smogon: "Sand",
  },
  hail: { id: "hail", label: "Hail", labelEs: "Granizo", smogon: "Hail" },
  snow: { id: "snow", label: "Snow", labelEs: "Nieve", smogon: "Snow" },
  harsh_sun: {
    id: "harsh_sun",
    label: "Harsh Sun",
    labelEs: "Sol intenso",
    smogon: "Harsh Sunshine",
  },
  heavy_rain: {
    id: "heavy_rain",
    label: "Heavy Rain",
    labelEs: "Lluvia intensa",
    smogon: "Heavy Rain",
  },
  strong_winds: {
    id: "strong_winds",
    label: "Strong Winds",
    labelEs: "Vientos fuertes",
    smogon: "Strong Winds",
  },
} as const;

export const Terrain = {
  none: { id: "none", label: "None", labelEs: "Ninguno", smogon: undefined },
  electric: {
    id: "electric",
    label: "Electric",
    labelEs: "Eléctrico",
    smogon: "Electric Terrain",
  },
  grassy: {
    id: "grassy",
    label: "Grassy",
    labelEs: "Hierba",
    smogon: "Grassy Terrain",
  },
  misty: {
    id: "misty",
    label: "Misty",
    labelEs: "Niebla",
    smogon: "Misty Terrain",
  },
  psychic: {
    id: "psychic",
    label: "Psychic",
    labelEs: "Psíquico",
    smogon: "Psychic Terrain",
  },
} as const;

export const Status = {
  none: { id: "none", label: "None", labelEs: "Ninguno", smogon: "" as const },
  burn: {
    id: "burn",
    label: "Burn",
    labelEs: "Quemado",
    smogon: "brn" as const,
  },
  paralyze: {
    id: "paralyze",
    label: "Paralyze",
    labelEs: "Paralizado",
    smogon: "par" as const,
  },
  poison: {
    id: "poison",
    label: "Poison",
    labelEs: "Envenenado",
    smogon: "psn" as const,
  },
  "badly-poisoned": {
    id: "badly-poisoned",
    label: "Badly Poisoned",
    labelEs: "Grav. envenenado",
    smogon: "tox" as const,
  },
  sleep: {
    id: "sleep",
    label: "Sleep",
    labelEs: "Dormido",
    smogon: "slp" as const,
  },
  freeze: {
    id: "freeze",
    label: "Freeze",
    labelEs: "Congelado",
    smogon: "frz" as const,
  },
} as const;

export type WeatherId = keyof typeof Weather;
export type TerrainId = keyof typeof Terrain;
export type StatusId = keyof typeof Status;

export interface BattleConditions {
  weather?: WeatherId | undefined;
  terrain?: TerrainId | undefined;
  isCriticalHit?: boolean | undefined;
}
