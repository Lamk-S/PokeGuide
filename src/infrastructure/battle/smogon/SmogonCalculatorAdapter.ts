"use client";
import { calculate, Field, Generations, Move, Pokemon } from "@smogon/calc";
import {
  mapStatus,
  mapTerrain,
  mapWeather,
} from "@/domain/battle/mappers/BattleIdMappers";
import type {
  IResolvedBattleScenario,
  IResolvedParticipant,
} from "@/domain/battle/types/BattleParticipant";
import { normalizeId } from "@/domain/shared/utils/normalizeId";

type StatSetLike = Record<string, unknown>;

function toNumber(v: unknown): number {
  if (typeof v === "number") return v;
  if (v && typeof v === "object" && "value" in v) {
    const obj = v as { value: unknown };
    if (typeof obj.value === "number") return obj.value;
  }
  const n = Number(v);
  return Number.isNaN(n) ? 0 : n;
}

function extractStatSet(set: unknown): {
  hp: number;
  atk: number;
  def: number;
  spa: number;
  spd: number;
  spe: number;
} {
  const out = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
  if (!set || typeof set !== "object") return out;
  const raw = set as StatSetLike;
  out.hp = toNumber(raw.hp);
  out.atk = toNumber(raw.attack ?? raw.atk);
  out.def = toNumber(raw.defense ?? raw.def);
  out.spa = toNumber(raw["special-attack"] ?? raw.spa);
  out.spd = toNumber(raw["special-defense"] ?? raw.spd);
  out.spe = toNumber(raw.speed ?? raw.spe);
  return out;
}

const ITEM_FALLBACK: Record<string, string> = {
  "chaleco-asalto": "Assault Vest",
  "chaleco asalto": "Assault Vest",
  vidasfera: "Life Orb",
  "vida esfera": "Life Orb",
  "banda-elegida": "Choice Band",
  "banda elegida": "Choice Band",
  "gafas-elegidas": "Choice Specs",
  "gafas elegidas": "Choice Specs",
  "panuelo-elegido": "Choice Scarf",
  "pañuelo-elegido": "Choice Scarf",
  restos: "Leftovers",
  "mineral-evol": "Eviolite",
  "mineral evol.": "Eviolite",
  "cinta-experto": "Expert Belt",
  periscopio: "Scope Lens",
  "vesta asalto": "Assault Vest",
};

const ABILITY_FALLBACK: Record<string, string> = {
  "piel-helada": "Refrigerate",
  "piel helada": "Refrigerate",
  "velo-arena": "Sand Veil",
  "velo arena": "Sand Veil",
  "mar-llamas": "Blaze",
  "mar llamas": "Blaze",
  torrente: "Torrent",
  espesura: "Overgrow",
  enjambre: "Swarm",
  agallas: "Guts",
  potencia: "Huge Power",
  impulso: "Speed Boost",
};

function kebabToTitle(s: string): string {
  return s
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function normalizeForSmogonItem(
  raw: string | null | undefined,
): string | undefined {
  if (!raw) return undefined;
  const norm = normalizeId(raw);
  if (!norm || norm === "none" || norm === "no-item" || norm === "-")
    return undefined;
  const lower = raw.toLowerCase().trim();
  if (ITEM_FALLBACK[norm]) return ITEM_FALLBACK[norm];
  if (ITEM_FALLBACK[lower]) return ITEM_FALLBACK[lower];
  if (raw.includes(" ") && /[A-Za-z]/.test(raw)) {
    return raw
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  }
  if (norm.includes("-")) return kebabToTitle(norm);
  if (/^[a-z]+$/.test(lower))
    return lower.charAt(0).toUpperCase() + lower.slice(1).toLowerCase();
  return raw;
}

function normalizeForSmogonAbility(
  raw: string | null | undefined,
): string | undefined {
  if (!raw) return undefined;
  const norm = normalizeId(raw);
  if (!norm || norm === "none" || norm === "no-ability") return undefined;
  const lower = raw.toLowerCase().trim();
  if (ABILITY_FALLBACK[norm]) return ABILITY_FALLBACK[norm];
  if (ABILITY_FALLBACK[lower]) return ABILITY_FALLBACK[lower];
  if (/^[A-Za-z -]+$/.test(raw)) return raw;
  return raw;
}

export class SmogonCalculatorAdapter {
  calculate(scenario: IResolvedBattleScenario) {
    const { generation, attacker, defender, moveName, moveId, conditions } =
      scenario;

    const attackerNameRaw =
      (attacker as { name?: string }).name?.toLowerCase() || "";
    if (generation === 1 && attackerNameRaw.includes("cosplay")) {
      throw new Error(
        `FORM_NOT_AVAILABLE_IN_GEN_1: ${attackerNameRaw} is not available in Gen ${generation}`,
      );
    }

    const gen = Generations.get(
      generation as unknown as import("@smogon/calc").GenerationNum,
    );

    const atkEvs = extractStatSet((attacker as { evs?: unknown }).evs);
    const defEvs = extractStatSet((defender as { evs?: unknown }).evs);
    const atkIvs = extractStatSet((attacker as { ivs?: unknown }).ivs);
    const defIvs = extractStatSet((defender as { ivs?: unknown }).ivs);

    const atkItem = normalizeForSmogonItem(
      (attacker as { item?: string | null }).item,
    );
    const defItem = normalizeForSmogonItem(
      (defender as { item?: string | null }).item,
    );
    const atkAbility = normalizeForSmogonAbility(
      (attacker as { ability?: string | null }).ability,
    );
    const defAbility = normalizeForSmogonAbility(
      (defender as { ability?: string | null }).ability,
    );
    const atkStatusRaw = (attacker as { status?: string }).status;
    const defStatusRaw = (defender as { status?: string }).status;
    const atkStatus = mapStatus(atkStatusRaw);
    const defStatus = mapStatus(defStatusRaw);

    const atkPokemon = new Pokemon(
      gen,
      (attacker as IResolvedParticipant).name || "Attacker",
      {
        level: (attacker as IResolvedParticipant).level ?? 50,
        nature:
          (attacker as { nature?: { name?: string } }).nature?.name ||
          "Serious",
        evs: {
          hp: atkEvs.hp,
          atk: atkEvs.atk,
          def: atkEvs.def,
          spa: atkEvs.spa,
          spd: atkEvs.spd,
          spe: atkEvs.spe,
        },
        ivs: {
          hp: atkIvs.hp,
          atk: atkIvs.atk,
          def: atkIvs.def,
          spa: atkIvs.spa,
          spd: atkIvs.spd,
          spe: atkIvs.spe,
        },
        item: atkItem,
        ability: atkAbility,
        status: atkStatus as never,
      },
    );

    const defPokemon = new Pokemon(
      gen,
      (defender as IResolvedParticipant).name || "Defender",
      {
        level: (defender as IResolvedParticipant).level ?? 50,
        nature:
          (defender as { nature?: { name?: string } }).nature?.name ||
          "Serious",
        evs: {
          hp: defEvs.hp,
          atk: defEvs.atk,
          def: defEvs.def,
          spa: defEvs.spa,
          spd: defEvs.spd,
          spe: defEvs.spe,
        },
        ivs: {
          hp: defIvs.hp,
          atk: defIvs.atk,
          def: defIvs.def,
          spa: defIvs.spa,
          spd: defIvs.spd,
          spe: defIvs.spe,
        },
        item: defItem,
        ability: defAbility,
        status: defStatus as never,
      },
    );

    if ((attacker as { id?: number }).id === 292) {
      atkPokemon.rawStats.hp = 1;
      atkPokemon.stats.hp = 1;
    }
    if ((defender as { id?: number }).id === 292) {
      defPokemon.rawStats.hp = 1;
      defPokemon.stats.hp = 1;
    }

    const move = new Move(gen, normalizeId(moveId || moveName), {
      isCrit: Boolean((attacker as { isCriticalHit?: boolean }).isCriticalHit),
    });

    const field = new Field({
      weather: mapWeather(conditions.weather) as never,
      terrain: mapTerrain(conditions.terrain) as never,
      isGravity: false,
    });

    const result = calculate(gen, atkPokemon, defPokemon, move, field);

    const damages = result.damage as number[] | number;
    const min = Array.isArray(damages)
      ? Math.min(...damages)
      : (damages as number);
    const max = Array.isArray(damages)
      ? Math.max(...damages)
      : (damages as number);
    const defHp = defPokemon.stats.hp || 1;

    const isDamageZero =
      (typeof damages === "number" && damages === 0) ||
      (Array.isArray(damages) &&
        damages.length > 0 &&
        damages[0] === 0 &&
        damages[damages.length - 1] === 0);

    let desc: string;
    let moveDescStr: string;
    try {
      desc = result.desc();
      moveDescStr = result.moveDesc() || "";
    } catch {
      desc = isDamageZero ? "0x" : "immune";
      moveDescStr = isDamageZero ? "0x" : "";
      if (!isDamageZero) {
        try {
          moveDescStr = result.moveDesc() || "";
        } catch {
          moveDescStr = "";
        }
      }
    }

    const isImmune =
      isDamageZero || moveDescStr.includes("0x") || desc.includes("0x");
    const effectiveness = isImmune ? 0 : 1;

    const activeModifiers: string[] = [];
    if (conditions.weather && conditions.weather !== "none") {
      activeModifiers.push(`WEATHER_${conditions.weather.toUpperCase()}`);
    }
    if (conditions.terrain && conditions.terrain !== "none") {
      activeModifiers.push(`TERRAIN_${conditions.terrain.toUpperCase()}`);
    }
    const pushStatusMod = (raw: string | null | undefined) => {
      if (!raw || raw === "none" || raw === "healthy" || raw === "saludable")
        return;
      const upper = String(raw)
        .toUpperCase()
        .replace(/-/g, "_")
        .replace(/ /g, "_");
      const token = `STATUS_${upper}`;
      if (!activeModifiers.includes(token)) activeModifiers.push(token);
    };
    pushStatusMod(atkStatusRaw);
    pushStatusMod(defStatusRaw);
    if ((attacker as { isCriticalHit?: boolean }).isCriticalHit) {
      activeModifiers.push("CRITICAL_HIT");
    }
    if (atkItem)
      activeModifiers.push(`ITEM_${atkItem.toUpperCase().replace(/-/g, "_")}`);
    if (defItem)
      activeModifiers.push(`ITEM_${defItem.toUpperCase().replace(/-/g, "_")}`);

    let summary = "OK";
    if (isImmune) summary = "TYPE_IMMUNITY";

    const isOHKO = min >= defHp;

    return {
      damage: {
        minDamage: isImmune ? 0 : min,
        maxDamage: isImmune ? 0 : max,
        minPercent: isImmune ? 0 : (min / defHp) * 100,
        maxPercent: isImmune ? 0 : (max / defHp) * 100,
      },
      defenderMaxHp: defHp,
      effectiveness,
      isOHKO,
      explanation: {
        summary,
        activeModifiers,
        rawDesc: desc,
      },
      moveCategoryUsed: (move as { category?: string }).category || "Physical",
      koAnalysis: {
        guaranteed: desc.includes("guaranteed") || min / defHp >= 1,
        hitsToKO:
          min >= defHp ? 1 : max >= defHp ? 1 : Math.ceil(defHp / (max || 1)),
        probability: (() => {
          if (!Array.isArray(damages)) return min >= defHp ? 100 : 0;
          const koRolls = damages.filter((d) => d >= defHp).length;
          return (koRolls / damages.length) * 100;
        })(),
      },
      rawDesc: desc,
      desc,
    };
  }
}
