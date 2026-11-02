import type {
  StatusId,
  TerrainId,
  WeatherId,
} from "@/domain/battle/value-objects/BattleModifiers";
import { normalizeId } from "@/domain/shared/utils/normalizeId";

export const VALID_WEATHER_IDS: Set<string> = new Set([
  "none",
  "sun",
  "rain",
  "sand",
  "snow",
  "hail",
  "harsh_sun",
  "heavy_rain",
  "strong_winds",
  "harsh-sun",
  "heavy-rain",
  "strong-winds",
]);

export const VALID_TERRAIN_IDS: Set<string> = new Set([
  "none",
  "electric",
  "grassy",
  "psychic",
  "misty",
]);

export const VALID_STATUS_IDS: Set<string> = new Set([
  "none",
  "burn",
  "paralyze",
  "poison",
  "badly-poisoned",
  "sleep",
  "freeze",
  "healthy",
  "tox",
  "brn",
  "par",
  "psn",
  "slp",
  "frz",
]);

export function normalizeWeatherId(id: string | null | undefined): WeatherId {
  if (!id) return "none";
  const n = normalizeId(id);
  if (VALID_WEATHER_IDS.has(n)) {
    if (n === "harsh-sun" || n === "harsh-sunshine") return "harsh_sun";
    if (n === "heavy-rain") return "heavy_rain";
    if (n === "strong-winds") return "strong_winds";
    return n as WeatherId;
  }
  return "none";
}

export function normalizeTerrainId(id: string | null | undefined): TerrainId {
  if (!id) return "none";
  const n = normalizeId(id);
  return VALID_TERRAIN_IDS.has(n) ? (n as TerrainId) : "none";
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
  return VALID_STATUS_IDS.has(raw) ? (raw as StatusId) : "none";
}
