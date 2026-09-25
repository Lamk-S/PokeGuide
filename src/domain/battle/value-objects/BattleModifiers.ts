export const Weather = {
  none: { id: "none" as const, label: "Ninguno", smogon: undefined },
  Sun: { id: "Sun" as const, label: "Sol", smogon: "Sun" as const },
  Rain: { id: "Rain" as const, label: "Lluvia", smogon: "Rain" as const },
  Sand: {
    id: "Sand" as const,
    label: "Tormenta Arena",
    smogon: "Sand" as const,
  },
  Snow: { id: "Snow" as const, label: "Nieve", smogon: "Snow" as const },
  Hail: { id: "Hail" as const, label: "Granizo", smogon: "Hail" as const },
} as const;
export type WeatherId = keyof typeof Weather;

export const Terrain = {
  none: { id: "none" as const, label: "Ninguno", smogon: undefined },
  Electric: {
    id: "Electric" as const,
    label: "Eléctrico",
    smogon: "Electric" as const,
  },
  Grassy: { id: "Grassy" as const, label: "Híper", smogon: "Grassy" as const },
  Psychic: {
    id: "Psychic" as const,
    label: "Psíquico",
    smogon: "Psychic" as const,
  },
  Misty: { id: "Misty" as const, label: "Niebla", smogon: "Misty" as const },
} as const;
export type TerrainId = keyof typeof Terrain;

export const Status = {
  none: { id: "none" as const, label: "Ninguno", smogon: undefined },
  brn: { id: "brn" as const, label: "Quemado", smogon: "brn" as const },
  par: { id: "par" as const, label: "Paralizado", smogon: "par" as const },
  psn: { id: "psn" as const, label: "Envenenado", smogon: "psn" as const },
  tox: { id: "tox" as const, label: "Intoxicado", smogon: "tox" as const },
  slp: { id: "slp" as const, label: "Dormido", smogon: "slp" as const },
  frz: { id: "frz" as const, label: "Congelado", smogon: "frz" as const },
} as const;
export type StatusId = keyof typeof Status;
