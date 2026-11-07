import { normalizeId } from "@/domain/shared/utils/normalizeId";

export const WEATHER_TO_SMOGON: Record<string, string> = {
  sun: "Sun",
  sol: "Sun",
  harsh_sun: "Harsh Sunshine",
  sol_abrasador: "Harsh Sunshine",
  "sol intenso": "Harsh Sunshine",
  "sol abrasador": "Harsh Sunshine",
  rain: "Rain",
  lluvia: "Rain",
  heavy_rain: "Heavy Rain",
  diluvio: "Heavy Rain",
  "lluvia intensa": "Heavy Rain",
  sand: "Sand",
  "tormenta arena": "Sand",
  hail: "Hail",
  granizo: "Hail",
  snow: "Snow",
  nieve: "Snow",
  strong_winds: "Strong Winds",
  turbulencias: "Strong Winds",
  vientos: "Strong Winds",
  none: "",
};

export const TERRAIN_TO_SMOGON: Record<string, string> = {
  electric: "Electric",
  electrico: "Electric",
  eléctrico: "Electric",
  grassy: "Grassy",
  hierba: "Grassy",
  cesped: "Grassy",
  césped: "Grassy",
  misty: "Misty",
  niebla: "Misty",
  psychic: "Psychic",
  psiquico: "Psychic",
  psíquico: "Psychic",
  none: "",
};

export const STATUS_TO_SMOGON: Record<string, string> = {
  burn: "brn",
  quemado: "brn",
  brn: "brn",
  poison: "psn",
  envenenado: "psn",
  psn: "psn",
  "bad-poison": "tox",
  "badly-poisoned": "tox",
  "grav. envenenado": "tox",
  tox: "tox",
  paralysis: "par",
  paralyze: "par",
  paralizado: "par",
  par: "par",
  sleep: "slp",
  dormido: "slp",
  slp: "slp",
  freeze: "frz",
  congelado: "frz",
  frz: "frz",
  none: "",
  saludable: "",
  healthy: "",
};

export function buildItemMapper(
  itemList: Array<{ name: string; nameEs?: string; id?: string }>,
): Map<string, string> {
  const map = new Map<string, string>();
  for (const it of itemList) {
    const smogonId = normalizeId(it.id || it.name);
    if (!smogonId) continue;
    if (it.nameEs) {
      map.set(normalizeId(it.nameEs), smogonId);
      map.set(it.nameEs.toLowerCase(), smogonId);
    }
    map.set(normalizeId(it.name), smogonId);
    map.set(it.name.toLowerCase(), smogonId);
    if (it.id) {
      map.set(normalizeId(it.id), smogonId);
      map.set(it.id.toLowerCase(), smogonId);
    }
  }
  const fallback: Record<string, string> = {
    "chaleco-asalto": "assault-vest",
    vidasfera: "life-orb",
    "banda-elegida": "choice-band",
    "gafas-elegidas": "choice-specs",
    "panuelo-elegido": "choice-scarf",
    "pañuelo-elegido": "choice-scarf",
    restos: "leftovers",
    "mineral-evol": "eviolite",
  };
  for (const [k, v] of Object.entries(fallback)) map.set(k, v);
  return map;
}

export function buildAbilityMapper(
  abilityList: Array<{ name: string; nameEs?: string; id?: string }>,
): Map<string, string> {
  const map = new Map<string, string>();
  for (const ab of abilityList) {
    const smogonId = normalizeId(ab.id || ab.name);
    if (!smogonId) continue;
    if (ab.nameEs) {
      map.set(normalizeId(ab.nameEs), smogonId);
      map.set(ab.nameEs.toLowerCase(), smogonId);
    }
    map.set(normalizeId(ab.name), smogonId);
    map.set(ab.name.toLowerCase(), smogonId);
  }
  const fallback: Record<string, string> = {
    "piel-helada": "refrigerate",
    "velo-arena": "sand-veil",
    "mar-llamas": "blaze",
    torrente: "torrent",
    espesura: "overgrow",
  };
  for (const [k, v] of Object.entries(fallback)) map.set(k, v);
  return map;
}

export function mapWeather(id: string | null | undefined): string | undefined {
  if (!id || id === "none") return undefined;
  const key = normalizeId(id);
  const lower = id.toLowerCase().trim();
  const mapped =
    WEATHER_TO_SMOGON[key] ?? WEATHER_TO_SMOGON[lower] ?? WEATHER_TO_SMOGON[id];
  return mapped || undefined;
}

export function mapTerrain(id: string | null | undefined): string | undefined {
  if (!id || id === "none") return undefined;
  const key = normalizeId(id);
  const lower = id.toLowerCase().trim();
  const mapped =
    TERRAIN_TO_SMOGON[key] ?? TERRAIN_TO_SMOGON[lower] ?? TERRAIN_TO_SMOGON[id];
  return mapped || undefined;
}

export function mapStatus(id: string | null | undefined): string | undefined {
  if (!id || id === "none" || id === "healthy" || id === "saludable")
    return undefined;
  const key = normalizeId(id);
  const lower = id.toLowerCase().trim();
  return (
    STATUS_TO_SMOGON[key] ??
    STATUS_TO_SMOGON[lower] ??
    STATUS_TO_SMOGON[id] ??
    undefined
  );
}
