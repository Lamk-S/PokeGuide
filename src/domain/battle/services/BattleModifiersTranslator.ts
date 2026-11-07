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
        found.effectEs ||
        found.descriptionEs ||
        found.effect ||
        "Habilidad equipada";
      return { label, effect };
    }
  }
  const map: Record<string, { label: string; effect: string }> = {
    "sand-veil": {
      label: "Velo Arena",
      effect: "Sube evasión 20% en tormenta arena, inmune a daño de arena",
    },
    "sand veil": {
      label: "Velo Arena",
      effect: "Sube evasión 20% en tormenta arena",
    },
    refrigerate: {
      label: "Piel Helada",
      effect: "Mov. Normal → Hielo, potencia 1.2x",
    },
    "piel helada": {
      label: "Piel Helada",
      effect: "Mov. Normal → Hielo, potencia 1.2x",
    },
    blaze: { label: "Mar Llamas", effect: "Potencia Fuego 1.5x con PS < 33%" },
    torrent: { label: "Torrente", effect: "Potencia Agua 1.5x con PS < 33%" },
    overgrow: {
      label: "Espesura",
      effect: "Potencia Planta 1.5x con PS < 33%",
    },
    swarm: { label: "Enjambre", effect: "Potencia Bicho 1.5x con PS < 33%" },
    intimidate: { label: "Intimidación", effect: "Baja ATQ rival al entrar" },
    levitate: { label: "Levitación", effect: "Inmune a tipo Tierra" },
    guts: { label: "Agallas", effect: "ATQ x1.5 con estado, ignora quemadura" },
    "huge-power": { label: "Potencia", effect: "ATQ x2" },
    "speed-boost": { label: "Impulso", effect: "Sube VEL cada turno" },
  };
  const norm = abilityId.toLowerCase();
  const found = map[norm];
  if (found) return found;
  return { label: String(abilityId), effect: "Habilidad equipada" };
}

export function getStatusDetailEs(
  statusId: StatusId | string | null | undefined,
): { label: string; effect: string } | null {
  if (
    !statusId ||
    statusId === "none" ||
    statusId === "healthy" ||
    statusId === "saludable"
  )
    return null;
  const map: Record<string, { label: string; effect: string }> = {
    burn: { label: "Quemado", effect: "Reduce ATQ 50% y daña 1/16 cada turno" },
    brn: { label: "Quemado", effect: "Reduce ATQ 50% y daña 1/16 cada turno" },
    quemado: {
      label: "Quemado",
      effect: "Reduce ATQ 50% y daña 1/16 cada turno",
    },
    poison: { label: "Envenenado", effect: "Pierde 1/8 PS cada turno" },
    psn: { label: "Envenenado", effect: "Pierde 1/8 PS cada turno" },
    envenenado: { label: "Envenenado", effect: "Pierde 1/8 PS cada turno" },
    "bad-poison": {
      label: "Grav. Envenenado",
      effect: "Veneno tóxico, daño creciente",
    },
    "badly-poisoned": {
      label: "Grav. Envenenado",
      effect: "Veneno tóxico, daño creciente",
    },
    tox: { label: "Grav. Envenenado", effect: "Veneno tóxico, daño creciente" },
    paralysis: { label: "Paralizado", effect: "VEL x0.5 y 25% no atacar" },
    paralyze: { label: "Paralizado", effect: "VEL x0.5 y 25% no atacar" },
    par: { label: "Paralizado", effect: "VEL x0.5 y 25% no atacar" },
    paralizado: { label: "Paralizado", effect: "VEL x0.5 y 25% no atacar" },
    sleep: { label: "Dormido", effect: "No ataca 1-3 turnos" },
    slp: { label: "Dormido", effect: "No ataca 1-3 turnos" },
    dormido: { label: "Dormido", effect: "No ataca 1-3 turnos" },
    freeze: {
      label: "Congelado",
      effect: "No ataca hasta descongelarse, 20% cada turno",
    },
    frz: { label: "Congelado", effect: "No ataca hasta descongelarse" },
    congelado: { label: "Congelado", effect: "No ataca hasta descongelarse" },
  };
  const key = String(statusId).toLowerCase().trim();
  return map[key] || { label: String(statusId), effect: "" };
}

export function getWeatherDetailEs(
  weatherId: WeatherId | string | null | undefined,
): { label: string; effect: string } {
  const map: Record<string, { label: string; effect: string }> = {
    sun: { label: "Sol", effect: "Fuego 1.5x, Agua 0.5x" },
    harsh_sun: {
      label: "Sol abrasador",
      effect: "Fuego 1.5x, Agua falla, sol extremo",
    },
    "sol abrasador": {
      label: "Sol abrasador",
      effect: "Fuego 1.5x, Agua falla",
    },
    "sol intenso": { label: "Sol intenso", effect: "Fuego 1.5x, Agua 0.5x" },
    rain: {
      label: "Lluvia",
      effect: "Agua 1.5x, Fuego 0.5x, Trueno/Vendaval 100%",
    },
    heavy_rain: {
      label: "Diluvio",
      effect: "Agua 1.5x, Fuego falla, lluvia extrema",
    },
    diluvio: { label: "Diluvio", effect: "Agua 1.5x, Fuego falla" },
    sand: {
      label: "Tormenta arena",
      effect: "Daño a no Roca/Tierra/Acero cada turno",
    },
    hail: { label: "Granizo", effect: "Daño a no Hielo cada turno" },
    snow: { label: "Nieve", effect: "Hielo DEF x1.5 (Gen9)" },
    strong_winds: {
      label: "Turbulencias",
      effect: "Anula debilidades Volador",
    },
    turbulencias: {
      label: "Turbulencias",
      effect: "Anula debilidades Volador",
    },
    vientos: { label: "Turbulencias", effect: "Anula debilidades Volador" },
    none: { label: "Ninguno", effect: "" },
  };
  const key = String(weatherId || "none").toLowerCase();
  return map[key] || { label: String(weatherId), effect: "" };
}

export function getTerrainDetailEs(
  terrainId: TerrainId | string | null | undefined,
): { label: string; effect: string } {
  const map: Record<string, { label: string; effect: string }> = {
    electric: {
      label: "Campo Eléctrico",
      effect: "Eléctrico 1.3x, no duerme en suelo",
    },
    grassy: {
      label: "Campo de Hierba",
      effect: "Planta 1.3x, cura 1/16, reduce Terremoto 0.5x",
    },
    hierba: { label: "Campo de Hierba", effect: "Planta 1.3x, cura 1/16" },
    misty: {
      label: "Campo de Niebla",
      effect: "Dragón 0.5x, inmune a estados y confusión",
    },
    niebla: {
      label: "Campo de Niebla",
      effect: "Dragón 0.5x, inmune a estados",
    },
    psychic: {
      label: "Campo Psíquico",
      effect: "Psíquico 1.3x, bloquea prioridad",
    },
    psiquico: {
      label: "Campo Psíquico",
      effect: "Psíquico 1.3x, bloquea prioridad",
    },
    none: { label: "Ninguno", effect: "" },
  };
  const key = String(terrainId || "none").toLowerCase();
  return map[key] || { label: String(terrainId), effect: "" };
}
