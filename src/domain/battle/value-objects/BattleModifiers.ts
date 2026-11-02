import { normalizeId } from "@/domain/shared/utils/normalizeId";

export type WeatherId =
  | "none"
  | "sun"
  | "rain"
  | "sand"
  | "snow"
  | "hail"
  | "harsh_sun"
  | "heavy_rain"
  | "strong_winds";

export type TerrainId = "none" | "electric" | "grassy" | "psychic" | "misty";

export type StatusId =
  | "none"
  | "burn"
  | "paralyze"
  | "poison"
  | "badly-poisoned"
  | "sleep"
  | "freeze"
  | "healthy";

export interface IBattleConditions {
  weather: WeatherId;
  terrain: TerrainId;
}

export const Weather = {
  none: { id: "none" as WeatherId, label: "None", labelEs: "Ninguno" },
  sun: { id: "sun" as WeatherId, label: "Sun", labelEs: "Sol" },
  rain: { id: "rain" as WeatherId, label: "Rain", labelEs: "Lluvia" },
  sand: { id: "sand" as WeatherId, label: "Sand", labelEs: "Tormenta arena" },
  snow: { id: "snow" as WeatherId, label: "Snow", labelEs: "Nieve" },
  hail: { id: "hail" as WeatherId, label: "Hail", labelEs: "Granizo" },
  harsh_sun: {
    id: "harsh_sun" as WeatherId,
    label: "Harsh Sun",
    labelEs: "Sol intenso",
  },
  heavy_rain: {
    id: "heavy_rain" as WeatherId,
    label: "Heavy Rain",
    labelEs: "Lluvia intensa",
  },
  strong_winds: {
    id: "strong_winds" as WeatherId,
    label: "Strong Winds",
    labelEs: "Vientos fuertes",
  },
} as const;

export const Terrain = {
  none: { id: "none" as TerrainId, label: "None", labelEs: "Ninguno" },
  electric: {
    id: "electric" as TerrainId,
    label: "Electric",
    labelEs: "Eléctrico",
  },
  grassy: { id: "grassy" as TerrainId, label: "Grassy", labelEs: "Hierba" },
  psychic: {
    id: "psychic" as TerrainId,
    label: "Psychic",
    labelEs: "Psíquico",
  },
  misty: { id: "misty" as TerrainId, label: "Misty", labelEs: "Niebla" },
} as const;

export const Status = {
  none: { id: "none" as StatusId, label: "None", labelEs: "Saludable" },
  healthy: {
    id: "healthy" as StatusId,
    label: "Healthy",
    labelEs: "Saludable",
  },
  burn: { id: "burn" as StatusId, label: "Burn", labelEs: "Quemado" },
  paralyze: {
    id: "paralyze" as StatusId,
    label: "Paralyze",
    labelEs: "Paralizado",
  },
  poison: { id: "poison" as StatusId, label: "Poison", labelEs: "Envenenado" },
  "badly-poisoned": {
    id: "badly-poisoned" as StatusId,
    label: "Badly Poisoned",
    labelEs: "Grav. envenenado",
  },
  sleep: { id: "sleep" as StatusId, label: "Sleep", labelEs: "Dormido" },
  freeze: { id: "freeze" as StatusId, label: "Freeze", labelEs: "Congelado" },
} as const;

export const VALID_WEATHER_IDS: readonly WeatherId[] = [
  "none",
  "sun",
  "rain",
  "sand",
  "snow",
  "hail",
  "harsh_sun",
  "heavy_rain",
  "strong_winds",
] as const;

export const VALID_TERRAIN_IDS: readonly TerrainId[] = [
  "none",
  "electric",
  "grassy",
  "psychic",
  "misty",
] as const;

export const VALID_STATUS_IDS: readonly StatusId[] = [
  "none",
  "burn",
  "paralyze",
  "poison",
  "badly-poisoned",
  "sleep",
  "freeze",
  "healthy",
] as const;

export function normalizeWeatherId(id: string | null | undefined): WeatherId {
  if (!id) return "none";
  const normalized = normalizeId(id);
  if ((VALID_WEATHER_IDS as readonly string[]).includes(normalized)) {
    return normalized as WeatherId;
  }
  if (normalized === "harsh-sun" || normalized === "harsh-sunshine")
    return "harsh_sun";
  if (normalized === "heavy-rain") return "heavy_rain";
  if (normalized === "strong-winds") return "strong_winds";
  return "none";
}

export function normalizeTerrainId(id: string | null | undefined): TerrainId {
  if (!id) return "none";
  const normalized = normalizeId(id);
  return (VALID_TERRAIN_IDS as readonly string[]).includes(normalized)
    ? (normalized as TerrainId)
    : "none";
}

export function normalizeStatusId(id: string | null | undefined): StatusId {
  if (!id) return "none";
  const raw = normalizeId(id);
  if (
    !raw ||
    raw === "saludable" ||
    raw === "ninguno" ||
    raw === "healthy" ||
    raw === ""
  )
    return "none";
  if (raw === "tox" || raw === "toxic" || raw === "bad-poison")
    return "badly-poisoned";
  if (raw === "brn") return "burn";
  if (raw === "par") return "paralyze";
  if (raw === "psn") return "poison";
  if (raw === "slp") return "sleep";
  if (raw === "frz") return "freeze";
  return (VALID_STATUS_IDS as readonly string[]).includes(raw)
    ? (raw as StatusId)
    : "none";
}

export const WEATHER_SMOGON_MAP: Record<WeatherId, string> = {
  none: "",
  sun: "sun",
  rain: "rain",
  sand: "sand",
  snow: "snow",
  hail: "hail",
  harsh_sun: "harshsunshine",
  heavy_rain: "heavyrain",
  strong_winds: "strongwinds",
};

export const TERRAIN_SMOGON_MAP: Record<TerrainId, string> = {
  none: "",
  electric: "electricterrain",
  grassy: "grassyterrain",
  psychic: "psychicterrain",
  misty: "mistyterrain",
};

export const STATUS_SMOGON_MAP: Record<StatusId, string> = {
  none: "",
  healthy: "",
  burn: "brn",
  paralyze: "par",
  poison: "psn",
  "badly-poisoned": "tox",
  sleep: "slp",
  freeze: "frz",
};
