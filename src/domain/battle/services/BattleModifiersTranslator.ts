import { COMPETITIVE_ABILITIES } from "@/domain/abilities/constants/competitiveAbilities";
import { normalizeStatusId } from "@/domain/battle/constants/BattleFieldConstants";
import type {
  StatusId,
  TerrainId,
  WeatherId,
} from "@/domain/battle/value-objects/BattleModifiers";
import { COMPETITIVE_ITEMS } from "@/domain/items/constants/competitiveItems";
import { normalizeId } from "@/domain/shared/utils/normalizeId";

export interface ModifierDetail {
  label: string;
  effect: string;
}

type AbilityLike = {
  id: string;
  name: string;
  nameEs?: string;
  description?: string;
  descriptionEs?: string;
};

type ItemLike = {
  id?: string;
  name: string;
  nameEs?: string;
  effect?: string;
  effectEs?: string;
  description?: string;
  descriptionEs?: string;
};

type ItemRecord = Record<string, ItemLike>;

const WEATHER_ES_MAP: Record<WeatherId, string> = {
  none: "Ninguno",
  sun: "Sol",
  rain: "Lluvia",
  sand: "Tormenta arena",
  snow: "Nieve",
  hail: "Granizo",
  harsh_sun: "Sol abrasador",
  heavy_rain: "Lluvia intensa",
  strong_winds: "Vientos fuertes",
};

const WEATHER_EFFECT_MAP: Record<WeatherId, string> = {
  none: "Sin clima",
  sun: "1.5x Fuego / 0.5x Agua",
  rain: "1.5x Agua / 0.5x Fuego",
  sand: "Daño residual a no Roca/Acero/Tierra",
  snow: "Defensa +50% tipo Hielo",
  hail: "Daño residual a no Hielo",
  harsh_sun: "Fuego 2x, Agua bloqueada",
  heavy_rain: "Agua 2x, Fuego bloqueado",
  strong_winds: "Volador inmune a Roca/Hielo/Eléctrico",
};

const TERRAIN_ES_MAP: Record<TerrainId, string> = {
  none: "Ninguno",
  electric: "Eléctrico",
  grassy: "Hierba",
  psychic: "Psíquico",
  misty: "Niebla",
};

const TERRAIN_EFFECT_MAP: Record<TerrainId, string> = {
  none: "Sin terreno",
  electric: "1.3x Eléctrico a apoyados",
  grassy: "1.3x Planta / 0.5x Tierra, cura",
  psychic: "1.3x Psíquico, bloquea prioridad",
  misty: "0.5x Dragón, evita estados",
};

const STATUS_ES_MAP: Record<StatusId, string> = {
  none: "Saludable",
  healthy: "Saludable",
  burn: "Quemado",
  paralyze: "Paralizado",
  poison: "Envenenado",
  "badly-poisoned": "Grav. envenenado",
  sleep: "Dormido",
  freeze: "Congelado",
};

const STATUS_EFFECT_MAP: Record<StatusId, string> = {
  none: "Sin penalización",
  healthy: "Sin penalización",
  burn: "ATQ ×0.5 y daño por turno",
  paralyze: "VEL ×0.5 y 25% fallo",
  poison: "Daño 1/8 por turno",
  "badly-poisoned": "Daño creciente por turno",
  sleep: "No ataca hasta despertar",
  freeze: "No ataca hasta descongelarse",
};

const ABILITY_ES_MAP = new Map<string, ModifierDetail>(
  (COMPETITIVE_ABILITIES as AbilityLike[]).map((a) => [
    normalizeId(a.id),
    {
      label: a.nameEs ?? a.name,
      effect: a.descriptionEs ?? a.description ?? a.nameEs ?? a.name,
    },
  ]),
);

const ITEM_ES_MAP = new Map<string, ModifierDetail>(
  (COMPETITIVE_ITEMS as ItemLike[]).map((i) => [
    normalizeId(i.id ?? i.name),
    {
      label: i.nameEs ?? i.name,
      effect: i.effectEs ?? i.effect ?? i.descriptionEs ?? "",
    },
  ]),
);

export function getWeatherLabelEs(weather: WeatherId): string {
  return WEATHER_ES_MAP[weather] ?? weather;
}

export function getWeatherDetailEs(weather: WeatherId): ModifierDetail {
  return {
    label: getWeatherLabelEs(weather),
    effect: WEATHER_EFFECT_MAP[weather] ?? "",
  };
}

export function getTerrainLabelEs(terrain: TerrainId): string {
  return TERRAIN_ES_MAP[terrain] ?? terrain;
}

export function getTerrainDetailEs(terrain: TerrainId): ModifierDetail {
  return {
    label: getTerrainLabelEs(terrain),
    effect: TERRAIN_EFFECT_MAP[terrain] ?? "",
  };
}

export function getStatusLabelEs(status: string | null | undefined): string {
  const normalized = normalizeStatusId(status ?? "none");
  return STATUS_ES_MAP[normalized] ?? String(status ?? "Saludable");
}

export function getStatusDetailEs(
  status: string | null | undefined,
): ModifierDetail | null {
  const normalized = normalizeStatusId(status ?? "none");
  if (normalized === "none" || normalized === "healthy") return null;
  return {
    label: STATUS_ES_MAP[normalized] ?? normalized,
    effect: STATUS_EFFECT_MAP[normalized] ?? "",
  };
}

export function getAbilityLabelEs(
  abilityId: string | null | undefined,
): string {
  if (!abilityId) return "—";
  const n = normalizeId(abilityId);
  return ABILITY_ES_MAP.get(n)?.label ?? abilityId.replace(/-/g, " ");
}

export function getAbilityDetailEs(
  abilityId: string | null | undefined,
): ModifierDetail | null {
  if (!abilityId) return null;
  const n = normalizeId(abilityId);
  const found = ABILITY_ES_MAP.get(n);
  if (!found) return { label: abilityId.replace(/-/g, " "), effect: "" };
  return found;
}

export function getItemLabelEs(itemId: string | null | undefined): string {
  if (!itemId) return "Ninguno";
  const n = normalizeId(itemId);
  return ITEM_ES_MAP.get(n)?.label ?? itemId.replace(/-/g, " ");
}

export function getItemDetailEs(
  itemId: string | null | undefined,
  itemList?: ItemLike[],
): ModifierDetail | null {
  if (!itemId) return null;
  const n = normalizeId(itemId);
  if (itemList && itemList.length > 0) {
    const direct =
      itemList.find((it) => normalizeId(it.id ?? "") === n) ??
      itemList.find((it) => normalizeId(it.name) === n) ??
      itemList.find((it) => normalizeId(it.nameEs ?? "") === n);
    if (direct) {
      return {
        label: direct.nameEs ?? direct.name,
        effect:
          direct.effectEs ??
          direct.descriptionEs ??
          direct.effect ??
          direct.description ??
          "",
      };
    }
  }
  const found = ITEM_ES_MAP.get(n);
  if (found) return found;
  return { label: itemId.replace(/-/g, " "), effect: "" };
}

export function resolveItemEsName(
  itemId: string | null | undefined,
  itemList?: ItemRecord | ItemLike[],
): string {
  if (!itemId) return "Ninguno";
  const n = normalizeId(itemId);
  if (Array.isArray(itemList)) {
    const found =
      itemList.find((it) => normalizeId(it.id ?? "") === n) ??
      itemList.find((it) => normalizeId(it.name) === n);
    if (found?.nameEs) return found.nameEs;
  } else if (itemList && typeof itemList === "object") {
    const rec = itemList as ItemRecord;
    const key1 = itemId;
    const key2 = n;
    const key3 = itemId.replace(/-/g, "_");
    const direct = rec[key1] ?? rec[key2] ?? rec[key3];
    if (direct?.nameEs) return direct.nameEs;
    if (direct?.name) return direct.name;
  }
  return getItemLabelEs(itemId);
}
