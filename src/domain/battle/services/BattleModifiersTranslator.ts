import type {
  StatusId,
  TerrainId,
  WeatherId,
} from "@/domain/battle/value-objects/BattleModifiers";

type AbilityEntry = {
  name: string;
  nameEs?: string;
  effectEs?: string;
  descriptionEs?: string;
  effect?: string;
  id?: string;
};
type ItemEntry = {
  name: string;
  nameEs?: string;
  effectEs?: string;
  descriptionEs?: string;
  effect?: string;
  id?: string;
};

type NamedEntry = { name?: unknown; id?: unknown; nameEs?: unknown };

function getLower(e: NamedEntry, key: keyof NamedEntry): string | undefined {
  const v = e[key];
  return typeof v === "string" ? v.toLowerCase() : undefined;
}

function findById<T extends NamedEntry>(
  list: T[],
  id: string | null | undefined,
): T | undefined {
  if (!id) return undefined;
  const norm = id.toLowerCase().replace(/_/g, "-").replace(/\s+/g, "-");
  return list.find((entry) => {
    const candidates = [
      getLower(entry, "name"),
      getLower(entry, "id"),
      getLower(entry, "nameEs"),
    ].filter((c): c is string => typeof c === "string" && c.length > 0);
    return candidates.some(
      (c) =>
        c === norm ||
        c.replace(/\s+/g, "-") === norm ||
        c.replace(/_/g, "-") === norm,
    );
  });
}

export function getItemDetailEs(
  itemId: string | null | undefined,
  itemList: ItemEntry[],
): { label: string; effect: string } | null {
  if (!itemId || itemId === "none") return null;
  const found = findById(itemList, itemId);
  if (!found) return { label: String(itemId), effect: "Objeto equipado" };
  const label: string = found.nameEs || found.name || String(itemId);
  const effect: string =
    found.effectEs ||
    found.descriptionEs ||
    found.effect ||
    "Efecto no disponible";
  return { label, effect };
}

export function getAbilityDetailEs(
  abilityId: string | null | undefined,
  abilityList?: AbilityEntry[],
): { label: string; effect: string } | null {
  if (!abilityId || abilityId === "none") return null;
  if (abilityList?.length) {
    const found = findById(abilityList, abilityId);
    if (found) {
      const label: string = found.nameEs || found.name || String(abilityId);
      const effect: string =
        found.effectEs || found.descriptionEs || found.effect || "";
      return { label, effect };
    }
  }
  const map: Record<string, string> = {
    "sand-veil": "Velo Arena",
    blaze: "Mar Llamas",
    torrent: "Torrente",
    overgrow: "Espesura",
    intimidate: "Intimidación",
    levitate: "Levitación",
    "sand veil": "Velo Arena",
    "mar llamas": "Mar Llamas",
  };
  const norm = abilityId.toLowerCase();
  const label: string = map[norm] || String(abilityId);
  return { label, effect: "" };
}

export function getStatusDetailEs(
  statusId: StatusId | string | null | undefined,
): { label: string; effect: string } | null {
  if (!statusId || statusId === "none") return null;
  const map: Record<string, { label: string; effect: string }> = {
    burn: { label: "Quemado", effect: "Reduce ATQ 50% y daña cada turno" },
    poison: { label: "Envenenado", effect: "Pierde PS cada turno" },
    "bad-poison": {
      label: "Grav. Envenenado",
      effect: "Veneno aumenta cada turno",
    },
    paralysis: { label: "Paralizado", effect: "VEL x0.5 y puede no atacar" },
    sleep: { label: "Dormido", effect: "No puede atacar 1-3 turnos" },
    freeze: {
      label: "Congelado",
      effect: "No puede atacar hasta descongelarse",
    },
  };
  const key = String(statusId);
  return map[key] || { label: key, effect: "" };
}

export function getWeatherDetailEs(
  weatherId: WeatherId | string | null | undefined,
): { label: string; effect: string } {
  const map: Record<string, { label: string; effect: string }> = {
    sun: { label: "Sol", effect: "Potencia Fuego 1.5x, Agua 0.5x" },
    rain: { label: "Lluvia", effect: "Potencia Agua 1.5x, Fuego 0.5x" },
    sand: {
      label: "Tormenta Arena",
      effect: "Daño a no Roca/Acero/Tierra cada turno",
    },
    hail: { label: "Granizo", effect: "Daño a no Hielo cada turno" },
    snow: { label: "Nieve", effect: "DEF x1.5 para tipo Hielo" },
    none: { label: "Ninguno", effect: "" },
  };
  const key = String(weatherId || "none");
  return map[key] || { label: key, effect: "" };
}

export function getTerrainDetailEs(
  terrainId: TerrainId | string | null | undefined,
): { label: string; effect: string } {
  const map: Record<string, { label: string; effect: string }> = {
    electric: {
      label: "Campo Eléctrico",
      effect: "Potencia Eléctrico 1.3x, no duerme",
    },
    grassy: {
      label: "Campo de Hierba",
      effect: "Potencia Planta 1.3x, cura 1/16 cada turno",
    },
    misty: {
      label: "Campo de Niebla",
      effect: "Reduce daño Dragón 0.5x, inmune a estados",
    },
    psychic: {
      label: "Campo Psíquico",
      effect: "Potencia Psíquico 1.3x, prioridad bloqueada",
    },
    none: { label: "Ninguno", effect: "" },
  };
  const key = String(terrainId || "none");
  return map[key] || { label: key, effect: "" };
}
